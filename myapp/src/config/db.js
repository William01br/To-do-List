import pg from "pg";
const { Pool } = pg;
import execute from "./sync.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testDbConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("connection successful with DB");
  } catch (err) {
    console.error("error connecting:", err);
  }
};

// function responsible for creating the database tables
execute();

export { pool, testDbConnection };
