import { pool } from "../../src/config/db.js";
import { Client } from "pg";

const DATABASE_NAME = process.env.DATABASE_URL.slice(
  process.env.DATABASE_URL.lastIndexOf("/") + 1
);

export async function createDatabase() {
  const adminClient = new Client({
    connectionString: process.env.POSTGRES_ADMIN_URL,
  });
  await adminClient.connect();

  await adminClient.query(`CREATE DATABASE ${DATABASE_NAME}`);

  await adminClient.end();
}

export async function clearDatabase() {
  try {
    // // search all tables from public schema
    // const { rows } = pool.query(`
    //         SELECT table_name
    //         FROM information_schema.tables
    //         WHERE table_schema = 'public'
    //         AND table_type = 'BASE TABLE';
    //         `);

    // console.log(rows);
    // if (rows.length === 0) {
    //   console.log("no table found");
    //   return;
    // }

    const tableNames = ["users", "refresh_tokens", "lists", "tasks"].join(", ");

    await pool.query("BEGIN");
    await pool.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error("Error while clean up the database:", e);
  }
}

export async function dropTestDatabase() {
  await pool.end();

  const adminClient = new Client({
    connectionString: process.env.POSTGRES_ADMIN_URL,
  });
  await adminClient.connect();

  await adminClient.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}`);

  await adminClient.end();
}
