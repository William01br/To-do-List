import dotenv from "dotenv";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const env = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: path.resolve(_dirname, `../../${env}`) });

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
