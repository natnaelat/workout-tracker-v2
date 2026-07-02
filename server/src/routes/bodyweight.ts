import { Router } from "express";
import { pool } from "../db/pool.js";
import { toKgAndLbs } from "../utils/units.js";

export const bodyweightRouter = Router();

// GET /bodyweight
bodyweightRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, weight_kg, weight_lbs, unit_entered, logged_on::text
       FROM body_weight_logs
       WHERE user_id = $1
       ORDER BY logged_on DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weight logs" });
  }
});

// POST /bodyweight
bodyweightRouter.post("/", async (req, res) => {
  const { weight, unit, date } = req.body;

  if (
    typeof weight !== "number" ||
    (unit !== "kg" && unit !== "lbs") ||
    typeof date !== "string"
  ) {
    return res.status(400).json({ error: "Invalid weight data" });
  }

  try {
    const { weightKg, weightLbs } = toKgAndLbs(weight, unit);
    const result = await pool.query(
      `INSERT INTO body_weight_logs (user_id, weight_kg, weight_lbs, unit_entered, logged_on)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, weight_kg, weight_lbs, unit_entered, logged_on::text`,
      [req.userId, weightKg, weightLbs, unit, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create weight log" });
  }
});

// PATCH /bodyweight/:id
bodyweightRouter.patch("/:id", async (req, res) => {
  const { weight, unit, date } = req.body;

  if (
    typeof weight !== "number" ||
    (unit !== "kg" && unit !== "lbs") ||
    typeof date !== "string"
  ) {
    return res.status(400).json({ error: "Invalid weight data" });
  }

  try {
    const { weightKg, weightLbs } = toKgAndLbs(weight, unit);
    const result = await pool.query(
      `UPDATE body_weight_logs
       SET weight_kg = $1, weight_lbs = $2, unit_entered = $3, logged_on = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, weight_kg, weight_lbs, unit_entered, logged_on::text`,
      [weightKg, weightLbs, unit, date, req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Weight log not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update weight log" });
  }
});

// DELETE /bodyweight/:id
bodyweightRouter.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM body_weight_logs WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Weight log not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete weight log" });
  }
});