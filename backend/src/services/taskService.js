import { pool } from "../config/database.js";

const verifyListExist = async (listId) => {
  try {
    const text = `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1)`;
    const value = [listId];
    console.log(listId);

    const listExist = await pool.query(text, value);
    console.log(listExist);
    if (!listExist) return null;

    return listExist;
  } catch (err) {
    console.error("Error verifying list existence:", err);
    throw new Error("Failed to verify list existence");
  }
};

const getAllTasksByListId = async (listId) => {
  try {
    const listExistence = await verifyListExist(listId);
    if (!listExistence) return null;

    const text = `SELECT * FROM tasks WHERE list_id = $1`;
    const value = [listId];

    const result = await pool.query(text, value);
    if (!result) return null;

    return result.rows;
  } catch (err) {
    console.error("Error getting tasks by listId:", err);
    throw new Error("Failed to get tasks by listId");
  }
};

const createTask = async (nameTask, comment, dueDate, listId) => {
  try {
    const listExistence = await verifyListExist(listId);
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

const getTaskByTaskId = async (listId, taskId) => {
  try {
    const listExistence = await verifyListExist(listId);
    if (!listExistence) return null;

    const text = `SELECT * FROM tasks WHERE list_id = $1 AND id = $2`;
    const values = [listId, taskId];

    const result = await pool.query(text, values);
    console.log(result);
    return result.rows;
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
  completed
) => {
  try {
    const listExist = await verifyListExist(listId);
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
    console.log(values);

    const result = await pool.query(text, values);
    // console.log(result);

    return result.rowCount;
  } catch (err) {
    console.error("Error updating task by taskId:", err);
    throw new Error("Failed to update task by taskId");
  }
};

export default {
  getAllTasksByListId,
  createTask,
  getTaskByTaskId,
  updateTaskByTaskId,
};
