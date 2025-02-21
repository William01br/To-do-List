import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { pool } from "../src/config/db.js";

beforeEach(async () => {
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM refresh_tokens");
  await pool.query("DELETE FROM lists");
  await pool.query("DELETE FROM tasks");
});

afterAll(async () => {
  await pool.end();
});
