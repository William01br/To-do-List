import { pool } from "../../src/config/db.js";

export default async function clearDatabase() {
  try {
    // search all tables from public schema
    const { rows } = pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
            `);

    if (rows.length === 0) {
      console.log("no table found");
      return;
    }

    const tableNames = rows.map((r) => `"public"."${r.table_name}"`).join(", ");

    await pool.query("BEGIN");
    await pool.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error("Error while clean up the database:", e);
  }
}
