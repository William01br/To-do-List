import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const env = process.env.NODE_ENV === "test" ? ".env.test.local" : ".env";
console.log(process.env.NODE_ENV);

dotenv.config({ path: path.resolve(_dirname, `../../${env}`) });
console.log(process.env.DATABASE_URL);

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// console.log(pool);

const testDbConnection = async () => {
  await pool.query("SELECT 1");
  console.log("connection successful with Database");
};

export { pool, testDbConnection };
