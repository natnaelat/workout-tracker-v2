import { Router } from "express";
import { pool } from "../db/pool.js";
import { exerciseSetsRouter } from "./exerciseSets.js";

export const exercisesRouter = Router();

// GET /exercises - list this user's exercises
exercisesRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM exercises WHERE user_id = $1 ORDER BY name ASC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// POST /exercises - create a new exercise
exercisesRouter.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Exercise name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO exercises (user_id, name) VALUES ($1, $2) RETURNING id, name",
      [req.userId, name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      // unique_violation -> they already have an exercise with this name
      return res.status(409).json({ error: "Exercise already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create exercise" });
  }
});

// DELETE /exercises/:id
exercisesRouter.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM exercises WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete exercise" });
  }
});

exercisesRouter.use("/:exerciseId/sets", exerciseSetsRouter);