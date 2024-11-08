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

const insertUser = pool.query(
  "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
  [username, email, password]
);

export { pool, insertUser };
