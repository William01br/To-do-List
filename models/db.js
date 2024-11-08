import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

function insertUser(username, email, password) {
  return pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, password]
  );
}

function selectEmailUser(email) {
  return pool.query("SELECT * FROM users WHERE email = $1", [email]);
}

async function deleteUserData(id) {
  const queryUser = "DELETE FROM users WHERE id = $1";

  try {
    await pool.query("BEGIN");

    await pool.query(queryUser, [id]);

    await pool.query("COMMIT");
    return { sucess: true };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

export { pool, insertUser, selectEmailUser, deleteUserData };
