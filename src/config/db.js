import dotenv from "dotenv";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { createTables } from "./models.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const env = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
console.log(process.env.NODE_ENV);

dotenv.config({ path: path.resolve(_dirname, `../../${env}`) });
console.log(process.env.DATABASE_URL);

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testDbConnection = async () => {
  try {
    await pool.query("SELECT NOW()");

    // creates the tables of application.
    await createTables();
    console.log("connection successful with DB");
  } catch (err) {
    console.error("error connecting:", err);
  }
};

export { pool, testDbConnection };
