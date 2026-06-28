import { readdirSync, readFileSync } from "fs";
import path from "path";
import { pool } from "../src/db/pool.js";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const applied = new Set(
    (await pool.query("SELECT filename FROM schema_migrations")).rows.map(
      (r) => r.filename
    )
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`Running migration: ${file}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");
      console.log(`✔ ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`✘ Failed on ${file}:`, err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.log("All migrations up to date.");
  await pool.end();
}

run();