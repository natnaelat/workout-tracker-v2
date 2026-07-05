import { Router } from "express";
import { pool } from "../db/pool.js";
import { exerciseSetsRouter } from "./exerciseSets.js";

export const exercisesRouter = Router();

// GET /exercises
exercisesRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, category, standard_exercise, equipment
       FROM exercises WHERE user_id = $1 ORDER BY name ASC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// POST /exercises
exercisesRouter.post("/", async (req, res) => {
  const { name, category, standard_exercise, equipment } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Exercise name is required" });
  }
  if (!category || (category !== "strength" && category !== "cardio")) {
    return res.status(400).json({ error: "Valid category is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO exercises (user_id, name, category, standard_exercise, equipment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, category, standard_exercise, equipment`,
      [req.userId, name.trim(), category, standard_exercise ?? null, equipment ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
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

// PATCH /exercises/:id
exercisesRouter.patch("/:id", async (req, res) => {
  const { name, category, standard_exercise, equipment } = req.body;

  try {
    const result = await pool.query(
      `UPDATE exercises
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           standard_exercise = COALESCE($3, standard_exercise),
           equipment = COALESCE($4, equipment)
       WHERE id = $5 AND user_id = $6
       RETURNING id, name, category, standard_exercise, equipment`,
      [name ?? null, category ?? null, standard_exercise ?? null, equipment ?? null, req.params.id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Exercise already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update exercise" });
  }
});

exercisesRouter.use("/:exerciseId/sets", exerciseSetsRouter);