import { pool } from "../src/config/db.js";

beforeAll(async () => {
  try {
    await pool.query("BEGIN");

    await pool.query("TRUNCATE TABLE users CASCADE RESTART IDENTITY");

    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error truncating table:", err);
  }
});

beforeEach(async () => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  console.log("Closing the database connection");
  await pool.end();
});
