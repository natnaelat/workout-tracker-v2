import { Router, type Request, type Response } from "express";
import { pool } from "../db/pool.js";
import { toKgAndLbs } from "../utils/units.js";

export const exerciseSetsRouter = Router({ mergeParams: true });

interface ExerciseSetParams {
  exerciseId: string;
}

exerciseSetsRouter.get("/", async (req: Request<ExerciseSetParams>, res: Response) => {
  try {
    const exerciseCheck = await pool.query(
      "SELECT id FROM exercises WHERE id = $1 AND user_id = $2",
      [req.params.exerciseId, req.userId]
    );
    if (exerciseCheck.rowCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const result = await pool.query(
      `SELECT id, weight_kg, weight_lbs, unit_entered, set_number, reps, performed_on::text
       FROM workout_sets
       WHERE exercise_id = $1 AND user_id = $2
       ORDER BY performed_on DESC, set_number ASC`,
      [req.params.exerciseId, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sets" });
  }
});

exerciseSetsRouter.post("/", async (req: Request<ExerciseSetParams>, res: Response) => {
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
    const exerciseCheck = await pool.query(
      "SELECT id FROM exercises WHERE id = $1 AND user_id = $2",
      [req.params.exerciseId, req.userId]
    );
    if (exerciseCheck.rowCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const { weightKg, weightLbs } = toKgAndLbs(weight, unit);

    const result = await pool.query(
      `INSERT INTO workout_sets (exercise_id, user_id, weight_kg, weight_lbs, unit_entered, set_number, reps, performed_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, weight_kg, weight_lbs, unit_entered, set_number, reps, performed_on::text`,
      [req.params.exerciseId, req.userId, weightKg, weightLbs, unit, setNumber, reps, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create set" });
  }
});