import { pool } from "../src/config/db.js";

export default async () => {
  console.log("Dropping the test database");
  await pool.query("DROP DATABASE IF EXISTS myapp_test");
  await pool.end();
};
