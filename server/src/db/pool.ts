import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.NODE_ENV === "production"
  ? process.env.DATABASE_URL
  : process.env.LOCAL_DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});