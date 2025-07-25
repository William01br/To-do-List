import { pool } from "../config/db.js";

const countTasksByListId = async (listId) => {
  const text = `SELECT COUNT(*) FROM tasks WHERE list_id = $1`;

  const result = await pool.query(text, [listId]);
  return result;
};

const create = async (nameTask, comment, dueDate, listId) => {
  const text = `INSERT INTO tasks (name_task, comment, due_date, list_id) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [nameTask, comment, dueDate, listId];

  const result = await pool.query(text, values);
  return result;
};

const getAllByListId = async (listId, limit, offset) => {
  const text = `
      SELECT * 
        FROM tasks 
        WHERE list_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`;
  const values = [listId, limit, offset];

  const result = await pool.query(text, values);
  return result;
};

const getByTaskId = async (listId, taskId) => {
  const text = `SELECT * FROM tasks WHERE list_id = $1 AND id = $2`;
  const values = [listId, taskId];

  const result = await pool.query(text, values);
  return result;
};

const updateByTaskId = async (listId, taskId, nameTask, comment, dueDate) => {
  const text = `
        UPDATE tasks 
        SET 
          name_task = COALESCE($1, name_task),
          comment = COALESCE($2, comment),
          due_date = COALESCE($3, due_date),
        WHERE list_id = $4 AND id = $5
        RETURNING *`;
  const values = [nameTask, comment, dueDate, listId, taskId];

  const result = await pool.query(text, values);
  return result;
};

const deleteByTaskId = async (listId, taskId) => {
  const text = `DELETE FROM tasks WHERE list_id = $1 AND id = $2`;
  const values = [listId, taskId];

  await pool.query(text, values);
};

const setCompleted = async (listId, taskId, completed) => {
  const text =
    "UPDATE tasks SET completed = $3 WHERE list_id = $1 AND id = $2 RETURNING *";
  const values = [listId, taskId, completed];

  const result = await pool.query(text, values);
  return result;
};

export default {
  countTasksByListId,
  getAllByListId,
  create,
  getByTaskId,
  updateByTaskId,
  deleteByTaskId,
  setCompleted,
};
