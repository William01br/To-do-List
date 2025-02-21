import { pool } from "../config/db.js";

const verifyListExist = async (listId, userId) => {
  try {
    const text = `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`;
    const values = [listId, userId];

    const result = await pool.query(text, values);
    return result.rows[0].exists;
  } catch (err) {
    throw err;
  }
};

const getAllTasksByListId = async (listId, userId) => {
  try {
    const listExistence = await verifyListExist(listId, userId);
    if (!listExistence) return null;

    const text = `SELECT * FROM tasks WHERE list_id = $1`;

    const result = await pool.query(text, [listId]);

    return result.rows;
  } catch (err) {
    console.error("Error getting tasks by listId:", err);
    throw new Error("Failed to get tasks by listId");
  }
};

const createTask = async (nameTask, comment, dueDate, listId, userId) => {
  try {
    const listExistence = await verifyListExist(listId, userId);
    if (!listExistence) return null;

    const text = `INSERT INTO tasks (name_task, comment, due_date, list_id) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [nameTask, comment, dueDate, listId];

    const result = await pool.query(text, values);

    return result.rows[0];
  } catch (err) {
    console.error("Error creating task:", err);
    throw new Error("Failed to create task");
  }
};

const getTaskByTaskId = async (listId, taskId, userId) => {
  try {
    const listExistence = await verifyListExist(listId, userId);
    if (!listExistence) return null;

    const text = `SELECT * FROM tasks WHERE list_id = $1 AND id = $2`;
    const values = [listId, taskId];

    const result = await pool.query(text, values);

    return result.rows[0];
  } catch (err) {
    console.error("Error getting task by taskId:", err);
    throw new Error("Failed to get task by taskId");
  }
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
  try {
    const listExist = await verifyListExist(listId, userId);
    if (!listExist) return null;

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

    return result.rowCount;
  } catch (err) {
    console.error("Error updating task by taskId:", err);
    throw new Error("Failed to update task by taskId");
  }
};

const deleteTaskByTaskId = async (listId, taskId, userId) => {
  try {
    const listExist = await verifyListExist(listId, userId);
    if (!listExist) return null;

    const text = `DELETE FROM tasks WHERE list_id = $1 AND id = $2`;
    const values = [listId, taskId];

    const result = await pool.query(text, values);

    return result.rowCount;
  } catch (err) {
    console.error("Error deleting task by taskId:", err);
    throw new Error("Failed to delete task by taskId");
  }
};

export default {
  getAllTasksByListId,
  createTask,
  getTaskByTaskId,
  updateTaskByTaskId,
  deleteTaskByTaskId,
  verifyListExist,
};
