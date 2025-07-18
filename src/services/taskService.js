import { pool } from "../config/db.js";
import NotFoundErrorHttp from "../errors/NotFoundError.js";

const getCountTasksByListId = async (listId) => {
  const text = `SELECT COUNT(*) FROM tasks WHERE list_id = $1`;

  const result = await pool.query(text, [listId]);
  return Number(result.rows[0].count);
};

const verifyListExist = async (listId, userId) => {
  const text = `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`;
  const values = [listId, userId];

  const result = await pool.query(text, values);
  return result.rows[0].exists;
};

const getAllTasksByListId = async (listId, userId, limit, offset) => {
  const listExistence = await verifyListExist(listId, userId);
  if (!listExistence)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const text = `
      SELECT * 
        FROM tasks 
        WHERE list_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`;
  const values = [listId, limit, offset];

  const result = await pool.query(text, values);

  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "There are no tasks",
      context: `list Id: ${listId}`,
    });

  return result.rows;
};

const createTask = async (nameTask, comment, dueDate, listId, userId) => {
  const listExistence = await verifyListExist(listId, userId);
  if (!listExistence)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const text = `INSERT INTO tasks (name_task, comment, due_date, list_id) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [nameTask, comment, dueDate, listId];

  const result = await pool.query(text, values);

  return result.rows[0];
};

const getTaskByTaskId = async (listId, taskId, userId) => {
  const listExistence = await verifyListExist(listId, userId);
  if (!listExistence)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const text = `SELECT * FROM tasks WHERE list_id = $1 AND id = $2`;
  const values = [listId, taskId];

  const result = await pool.query(text, values);

  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "Task not found",
    });

  return result.rows;
};

const updateTaskByTaskId = async (
  listId,
  taskId,
  nameTask,
  comment,
  dueDate,
  completed,
  userId
) => {
  const listExist = await verifyListExist(listId, userId);
  if (!listExist)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const text = `
        UPDATE tasks 
        SET 
          name_task = COALESCE($1, name_task),
          comment = COALESCE($2, comment),
          due_date = COALESCE($3, due_date),
          completed = COALESCE($4, completed)
        WHERE list_id = $5 AND id = $6`;
  const values = [nameTask, comment, dueDate, completed, listId, taskId];

  const result = await pool.query(text, values);

  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "Task not found",
    });

  // should return the task updated
  return result.rowCount;
};

const deleteTaskByTaskId = async (listId, taskId, userId) => {
  const listExist = await verifyListExist(listId, userId);
  if (!listExist)
    throw new NotFoundErrorHttp({
      message: "List not found",
    });

  const text = `DELETE FROM tasks WHERE list_id = $1 AND id = $2`;
  const values = [listId, taskId];

  // must be return 204 - route IDEMPOTENT
  const result = await pool.query(text, values);

  return result.rowCount;
};

export default {
  getAllTasksByListId,
  createTask,
  getTaskByTaskId,
  updateTaskByTaskId,
  deleteTaskByTaskId,
  verifyListExist,
  getCountTasksByListId,
};
