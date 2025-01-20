import { pool } from "../config/database.js";

const createListDefault = async (userId) => {
  try {
    const text =
      "INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3)";
    const values = ["Default List", userId, true];

    const result = await pool.query(text, values);
    console.log(result);
    if (result.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error creating default list:", err);
    throw new Error("Failed to create default list");
  }
};

const createList = async (listName, userId) => {
  try {
    const text =
      "INSERT INTO lists (name_list, user_id) VALUES ($1, $2) RETURNING *";
    const values = [listName, userId];

    const result = await pool.query(text, values);
    if (result.rows[0].length === 0) return null;

    return result.rows[0];
  } catch (err) {
    console.error("Error creating list:", err);
    throw new Error("Failed to create list");
  }
};

export default { createListDefault, createList };
