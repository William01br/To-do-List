import { pool } from "../src/config/db.js";

export default async () => {
  console.log("Dropping the test database");
  await pool.query("DROP TABLE IF EXISTS users CASCADE");
  await pool.end();
};
