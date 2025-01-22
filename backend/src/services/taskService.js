import { pool } from "../config/database.js";

const verifyListExist = async (listId) => {
  try {
    const text = `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1)`;
    const value = [listId];

    const listExist = await pool.query(text, value);
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

export default { getAllTasksByListId, createTask };
