import pg from "pg";
const { Pool } = pg;
import execute from "./sync.js";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const testDbConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("connection successful with DB");
  } catch (err) {
    console.error("error connecting:", err);
  }
};

// execute the function for create tables. After this, comment the line for avoid unnecessary calls for DB.
// execute();

export { pool, testDbConnection };
