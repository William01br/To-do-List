import { pool } from "../config/database.js";

const getAllTasksByListId = async (listId) => {
  try {
    const text = `SELECT * FROM tasks WHERE list_id = $1`;
    const value = [listId];

    const result = await pool.query(text, value);
    if (result.rows.length === 0) return null;

    return result.rows;
  } catch (err) {
    console.error("Error getting tasks by listId:", err);
    throw new Error("Failed to get tasks by listId");
  }
};

export default { getAllTasksByListId };
