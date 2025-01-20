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

export default { createListDefault };
