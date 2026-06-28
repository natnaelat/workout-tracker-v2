import { Router } from "express";
import { pool } from "../db/pool.js";
import { toKgAndLbs } from "../utils/units.js";

export const setsRouter = Router();

setsRouter.patch("/:id", async (req, res) => {
  const { weight, unit, setNumber, reps, date } = req.body;

  if (
    typeof weight !== "number" ||
    (unit !== "kg" && unit !== "lbs") ||
    typeof setNumber !== "number" ||
    typeof reps !== "number" ||
    typeof date !== "string"
  ) {
    return res.status(400).json({ error: "Invalid set data" });
  }

  try {
    const { weightKg, weightLbs } = toKgAndLbs(weight, unit);

    const result = await pool.query(
      `UPDATE workout_sets
       SET weight_kg = $1, weight_lbs = $2, unit_entered = $3, set_number = $4, reps = $5, performed_on = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, weight_kg, weight_lbs, unit_entered, set_number, reps, performed_on::text`,
      [weightKg, weightLbs, unit, setNumber, reps, date, req.params.id, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Set not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update set" });
  }
});

setsRouter.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM workout_sets WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Set not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete set" });
  }
});