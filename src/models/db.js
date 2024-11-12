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

async function insertUser(username, email, password) {
  const queryUser =
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";

  try {
    await pool.query("BEGIN");

    await pool.query(queryUser, [username, email, password]);

    await pool.query("COMMIT");
    return { sucess: true };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
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

async function insertTask(user_id, title, description, due_date) {
  const queryTask =
    "INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *";

  try {
    await pool.query("BEGIN");

    await pool.query(queryTask, [user_id, title, description, due_date]);

    await pool.query("COMMIT");
    return { sucess: true };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function updateTaskData(setClause, values, index) {
  console.log(setClause);
  console.log(values);
  const queryTask = `UPDATE tasks SET ${setClause.join(
    ", "
  )} WHERE user_id = $${index} AND id = $${index + 1} RETURNING *;`;

  try {
    await pool.query("BEGIN");

    await pool.query(queryTask, values);

    await pool.query("COMMIT");
    return { sucess: true };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

async function deleteTaskData(taskId, user_id) {
  const queryTask = "DELETE FROM tasks WHERE id = $1 AND user_id = $2";

  try {
    await pool.query("BEGIN");

    const queryDelete = await pool.query(queryTask, [taskId, user_id]);
    const numberRowsDeleted = queryDelete.rowCount;
    console.log(numberRowsDeleted);

    await pool.query("COMMIT");
    return numberRowsDeleted;
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

export {
  pool,
  insertUser,
  deleteUserData,
  insertTask,
  updateTaskData,
  deleteTaskData,
};
