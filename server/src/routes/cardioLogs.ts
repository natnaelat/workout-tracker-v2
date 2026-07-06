import { Router } from "express";
import { pool } from "../db/pool.js";

export const cardioLogsRouter = Router({ mergeParams: true });

// GET /exercises/:exerciseId/cardio
cardioLogsRouter.get("/", async (req, res) => {
  try {
    const exerciseCheck = await pool.query(
      "SELECT id FROM exercises WHERE id = $1 AND user_id = $2",
      [req.params.exerciseId, req.userId]
    );
    if (exerciseCheck.rowCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const result = await pool.query(
      `SELECT id, distance, distance_unit, duration_secs, performed_on::text
       FROM cardio_logs
       WHERE exercise_id = $1 AND user_id = $2
       ORDER BY performed_on DESC`,
      [req.params.exerciseId, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cardio logs" });
  }
});

// POST /exercises/:exerciseId/cardio
cardioLogsRouter.post("/", async (req, res) => {
  const { distance, distance_unit, duration_secs, date } = req.body;

  if (
    typeof distance !== "number" ||
    (distance_unit !== "mi" && distance_unit !== "km") ||
    typeof duration_secs !== "number" ||
    typeof date !== "string"
  ) {
    return res.status(400).json({ error: "Invalid cardio log data" });
  }

  try {
    const exerciseCheck = await pool.query(
      "SELECT id FROM exercises WHERE id = $1 AND user_id = $2",
      [req.params.exerciseId, req.userId]
    );
    if (exerciseCheck.rowCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const result = await pool.query(
      `INSERT INTO cardio_logs (exercise_id, user_id, distance, distance_unit, duration_secs, performed_on)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, distance, distance_unit, duration_secs, performed_on::text`,
      [req.params.exerciseId, req.userId, distance, distance_unit, duration_secs, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create cardio log" });
  }
});

// PATCH /cardio/:id
export const cardioLogsPatchRouter = Router();

cardioLogsPatchRouter.patch("/:id", async (req, res) => {
  const { distance, distance_unit, duration_secs, date } = req.body;

  if (
    typeof distance !== "number" ||
    (distance_unit !== "mi" && distance_unit !== "km") ||
    typeof duration_secs !== "number" ||
    typeof date !== "string"
  ) {
    return res.status(400).json({ error: "Invalid cardio log data" });
  }

  try {
    const result = await pool.query(
      `UPDATE cardio_logs
       SET distance = $1, distance_unit = $2, duration_secs = $3, performed_on = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, distance, distance_unit, duration_secs, performed_on::text`,
      [distance, distance_unit, duration_secs, date, req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cardio log not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cardio log" });
  }
});

// DELETE /cardio/:id
cardioLogsPatchRouter.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM cardio_logs WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cardio log not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete cardio log" });
  }
});