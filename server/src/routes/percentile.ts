import { Router } from "express";
import { pool } from "../db/pool.js";
import { calculateE1RM } from "../utils/units.js";
import { calculateStrengthPercentile } from "../utils/strengthStandards.js";
import { calculateCardioPercentile } from "../utils/cardioStandards.js";

export const percentileRouter = Router();

// GET /percentile?exerciseId=...&type=strength|cardio&bestEver=true|false&ageAdjusted=true|false
percentileRouter.get("/", async (req, res) => {
  const { exerciseId, type, bestEver, ageAdjusted } = req.query;
  const useBestEver = bestEver === "true";
  const useAgeAdjusted = ageAdjusted === "true";

  try {
    // Get user profile
    const userResult = await pool.query(
      "SELECT sex, birth_date::text FROM users WHERE id = $1",
      [req.userId]
    );
    if (userResult.rowCount === 0) return res.status(404).json({ error: "User not found" });

    const { sex, birth_date } = userResult.rows[0];
    if (!sex) return res.json({ percentile: null, reason: "missing_profile" });

    // Get latest bodyweight
    const weightResult = await pool.query(
      "SELECT weight_kg FROM body_weight_logs WHERE user_id = $1 ORDER BY logged_on DESC LIMIT 1",
      [req.userId]
    );
    if (weightResult.rowCount === 0) return res.json({ percentile: null, reason: "missing_weight" });
    const bodyweightKg = Number(weightResult.rows[0].weight_kg);

    // Get exercise info
    const exerciseResult = await pool.query(
      "SELECT standard_exercise, category FROM exercises WHERE id = $1 AND user_id = $2",
      [exerciseId, req.userId]
    );
    if (exerciseResult.rowCount === 0) return res.status(404).json({ error: "Exercise not found" });
    const { standard_exercise } = exerciseResult.rows[0];

    if (type === "strength") {
      // Get sets
      const setsQuery = useBestEver
        ? `SELECT weight_kg, reps, performed_on FROM workout_sets 
           WHERE exercise_id = $1 AND user_id = $2 
           ORDER BY performed_on DESC`
        : `SELECT weight_kg, reps, performed_on FROM workout_sets 
           WHERE exercise_id = $1 AND user_id = $2 
           AND performed_on = (SELECT MAX(performed_on) FROM workout_sets WHERE exercise_id = $1 AND user_id = $2)`;

      const setsResult = await pool.query(setsQuery, [exerciseId, req.userId]);
      if (setsResult.rowCount === 0) return res.json({ percentile: null, reason: "no_sets" });

      const bestE1RM = Math.max(
        ...setsResult.rows.map((r: any) => calculateE1RM(Number(r.weight_kg), r.reps))
      );

      const percentile = calculateStrengthPercentile(
        standard_exercise,
        sex,
        bestE1RM,
        bodyweightKg,
        useAgeAdjusted
      );

      return res.json({ percentile });
    }

    if (type === "cardio") {
      if (!birth_date && useAgeAdjusted) {
        return res.json({ percentile: null, reason: "missing_birthdate" });
      }

      const cardioQuery = useBestEver
        ? `SELECT duration_secs, distance, distance_unit FROM cardio_logs
           WHERE exercise_id = $1 AND user_id = $2
           ORDER BY performed_on DESC`
        : `SELECT duration_secs, distance, distance_unit FROM cardio_logs
           WHERE exercise_id = $1 AND user_id = $2
           AND performed_on = (SELECT MAX(performed_on) FROM cardio_logs WHERE exercise_id = $1 AND user_id = $2)`;

      const cardioResult = await pool.query(cardioQuery, [exerciseId, req.userId]);
      if (cardioResult.rowCount === 0) return res.json({ percentile: null, reason: "no_logs" });

      // Find best pace (lowest secs per mile) from results
      const paces = cardioResult.rows.map((r: any) => {
        const distanceMi = r.distance_unit === "mi"
          ? Number(r.distance)
          : Number(r.distance) / 1.60934;
        return r.duration_secs / distanceMi;
      });

      const bestPace = useBestEver ? Math.min(...paces) : paces[0];

      const percentile = calculateCardioPercentile(
        sex,
        bestPace,
        birth_date,
        useAgeAdjusted
      );

      return res.json({ percentile });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate percentile" });
  }
});