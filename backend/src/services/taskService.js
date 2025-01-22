import { pool } from "../config/database.js";
import list from "../models/list.js";

const getAllTasksByListId = async (listId) => {
  try {
    const text1 = `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1)`;
    const value1 = [listId];

    const listExist = await pool.query(text1, value1);
    if (!listExist) return null;

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

export default { getAllTasksByListId };
