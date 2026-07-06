import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import { devAuth } from "./middleware/devAuth.js";
import { exercisesRouter } from "./routes/exercises.js";
import { setsRouter } from "./routes/sets.js";
import { bodyweightRouter } from "./routes/bodyweight.js";
import { profileRouter } from "./routes/profile.js";
import { cardioLogsRouter, cardioLogsPatchRouter } from "./routes/cardioLogs.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

app.use("/exercises", devAuth, exercisesRouter);
app.use("/sets", devAuth, setsRouter);
app.use("/exercises/:exerciseId/cardio", devAuth, cardioLogsRouter);
app.use("/cardio", devAuth, cardioLogsPatchRouter);
app.use("/bodyweight", devAuth, bodyweightRouter);
app.use("/profile", devAuth, profileRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});