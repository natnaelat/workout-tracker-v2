import { Router } from "express";
import { pool } from "../db/pool.js";

export const profileRouter = Router();

profileRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT first_name, last_name, birth_date::text, sex, height_ft, height_in
       FROM users WHERE id = $1`,
      [req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const weightResult = await pool.query(
      `SELECT weight_kg, weight_lbs, unit_entered, logged_on::text
       FROM body_weight_logs
       WHERE user_id = $1
       ORDER BY logged_on DESC
       LIMIT 1`,
      [req.userId]
    );

    res.json({
      ...result.rows[0],
      latestWeight: weightResult.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

profileRouter.patch("/", async (req, res) => {
  const { first_name, last_name, birth_date, sex, height_ft, height_in } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         birth_date = COALESCE($3, birth_date),
         sex = COALESCE($4, sex),
         height_ft = COALESCE($5, height_ft),
         height_in = COALESCE($6, height_in)
       WHERE id = $7
       RETURNING first_name, last_name, birth_date::text, sex, height_ft, height_in`,
      [first_name ?? null, last_name ?? null, birth_date ?? null, sex ?? null, height_ft ?? null, height_in ?? null, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});