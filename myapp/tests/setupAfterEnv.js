import { pool } from "../src/config/db.js";

beforeAll(async () => {
  console.log("Reseting database");
  await pool.query("SET session_replication_role = 'replica';");
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM refresh_tokens");
  await pool.query("DELETE FROM lists");
  await pool.query("DELETE FROM tasks");
  await pool.query("SET session_replication_role = 'origin';");
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  console.log("Closing the database connection");
  await pool.end();
});
