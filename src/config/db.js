import dotenv from "dotenv";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { createTables } from "./models.js";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const env = process.env.NODE_ENV === "test" ? ".env.test.local" : ".env";
console.log(process.env.NODE_ENV);

dotenv.config({ path: path.resolve(_dirname, `../../${env}`) });
console.log(process.env.DATABASE_URL);

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testDbConnection = async () => {
  await pool.query("SELECT NOW()");
  await createTables();
  console.log("connection successful with Database");
};

export { pool, testDbConnection };
