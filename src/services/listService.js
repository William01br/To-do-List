import { pool } from "../config/db.js";

const getCountListsByUserId = async (userId) => {
  try {
    const text = "SELECT COUNT(*) FROM lists WHERE user_id = $1";
    const values = [userId];

    const result = await pool.query(text, values);
    return Number(result.rows[0].count);
  } catch (err) {
    console.error("error counting lists:", err);
    throw err;
  }
};

const createListDefault = async (userId) => {
  try {
    const text =
      "INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3)";
    const values = ["Default List", userId, true];

    const result = await pool.query(text, values);
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
    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (err) {
    console.error("Error creating list:", err);
    throw new Error("Failed to create list");
  }
};

const getAllListsByUserId = async (userId, limit, offset) => {
  try {
    const text = `
    SELECT 
    l.id AS list_id,
    l.name_list,
    l.created_at,
    COALESCE(
        ARRAY_AGG(
            CASE 
                WHEN t.id IS NOT NULL AND t.name_task IS NOT NULL THEN
                    JSON_BUILD_OBJECT(
                        'task_id', t.id,
                        'task_name', t.name_task,
                        'task_description', t.comment,
                        'task_due_date', t.due_date,
                        'task_finished', t.completed,
                        'task_created_at', t.created_at
                    )
                ELSE NULL
            END
            ORDER BY t.created_at
        ), '{}'
    ) AS tasks
    FROM 
      lists l
    LEFT JOIN 
      tasks t ON l.id = t.list_id
    WHERE 
      l.user_id = $1
    GROUP BY 
      l.id, l.name_list, l.created_at
    ORDER BY 
      l.created_at DESC
    LIMIT $2 OFFSET $3`;

    console.log("funcao banco", limit, offset);
    const values = [userId, limit, offset];
    const result = await pool.query(text, values);
    console.log(result.rows);
    if (result.rows.length === 0) return null;

    return result.rows;
  } catch (err) {
    console.error("Error getting all lists by userId:", err);
    throw new Error("Failed to get all lists by userId");
  }
};

const getListByListId = async (listId, limit, offset) => {
  try {
    const text = `
    SELECT 
        l.id AS list_id,
        l.name_list AS list_name,
        l.created_at,
        COALESCE(JSON_AGG(t) FILTER (WHERE t.id IS NOT NULL), '[]') AS tasks
      FROM lists l
      LEFT JOIN (
        SELECT *
        FROM tasks
        WHERE list_id = $1
        ORDER BY id
        LIMIT $2 OFFSET $3
      ) t ON t.list_id = l.id
      WHERE l.id = $1
      GROUP BY l.id`;
    const values = [listId, limit, offset];

    const result = await pool.query(text, values);
    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (err) {
    console.error("Error getting list by listId:", err);
    throw new Error("Failed to get list by listId");
  }
};

const updateByListId = async (listId, userId, nameList) => {
  try {
    const text = `
    UPDATE lists SET name_list = $1 WHERE id = $2 AND user_id = $3 AND is_protected = $4`;
    const values = [nameList, listId, userId, false];

    const result = await pool.query(text, values);
    // console.log(result);
    if (result.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error updating list by listId:", err);
    throw new Error("Failed to update list by listId");
  }
};

const deleteListByListId = async (listId, userId) => {
  try {
    const text = `DELETE FROM lists WHERE id = $1 AND user_id = $2 AND is_protected = $3`;
    const values = [listId, userId, false];

    const result = await pool.query(text, values);
    if (result.rowCount === 0) return null;

    return true;
  } catch (err) {
    console.error("Error deleting list by listId:", err);
    throw new Error("Failed to delete list by listId");
  }
};

export default {
  createListDefault,
  createList,
  getAllListsByUserId,
  getListByListId,
  updateByListId,
  deleteListByListId,
  getCountListsByUserId,
};
