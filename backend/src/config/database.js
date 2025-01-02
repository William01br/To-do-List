import pg from "pg";
const { Pool } = pg;

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

const execute = async (query) => {
  try {
    await pool.connect();
    await pool.query(query);
    return true;
  } catch (err) {
    console.error(err.stack);
    return false;
  } finally {
    await pool.end();
  }
};

export { pool, testDbConnection, execute };
