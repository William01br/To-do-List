const path = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
import dotenv from "dotenv";
dotenv.config({ path });

import pg from "pg";
const { Pool } = pg;

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

export { pool, testDbConnection };
