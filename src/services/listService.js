import { pool } from "../config/db.js";
import InternalErrorHttp from "../errors/InternalError.js";
import NotFoundErrorHttp from "../errors/NotFoundError.js";

const getCountListsByUserId = async (userId) => {
  const text = "SELECT COUNT(*) FROM lists WHERE user_id = $1";
  const values = [userId];

  const result = await pool.query(text, values);
  return Number(result.rows[0].count);
};

const createListDefault = async (userId) => {
  const text =
    "INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3)";
  const values = ["Default List", userId, true];

  const result = await pool.query(text, values);
  if (result.rowCount === 0) return null;

  return true;
};

const createList = async (listName, userId) => {
  const text =
    "INSERT INTO lists (name_list, user_id) VALUES ($1, $2) RETURNING *";
  const values = [listName, userId];

  const result = await pool.query(text, values);
  if (result.rows.length === 0)
    throw new InternalErrorHttp({
      message: "List not created",
      context: "reason unknown",
    });

  return result.rows[0];
};

const getAllListsByUserId = async (userId, limit, offset) => {
  const text = `
    SELECT * 
        FROM lists 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;`;
  const values = [userId, limit, offset];

  const result = await pool.query(text, values);

  // by default, one list is created when one user is registered.
  // whether not was returned at least one list, the user does not exist.
  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({
      message: "User not found",
    });
  return result.rows;
};

const getListByListId = async (listId, limit, offset) => {
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
        ORDER BY created_at
        LIMIT $2 OFFSET $3
      ) t ON t.list_id = l.id
      WHERE l.id = $1
      GROUP BY l.id`;
  const values = [listId, limit, offset];

  const result = await pool.query(text, values);
  if (result.rows.length === 0)
    throw new NotFoundErrorHttp({ message: "List not found" });

  return result.rows[0];
};

const updateByListId = async (listId, userId, nameList) => {
  const text = `
    UPDATE lists SET name_list = $1 WHERE id = $2 AND user_id = $3 AND is_protected = $4`;
  const values = [nameList, listId, userId, false];

  const result = await pool.query(text, values);
  if (result.rowCount === 0)
    throw new NotFoundErrorHttp({ message: "List not found" });

  // should return the list??
  return true;
};

const deleteListByListId = async (listId, userId) => {
  const text = `DELETE FROM lists WHERE id = $1 AND user_id = $2 AND is_protected = $3`;
  const values = [listId, userId, false];

  await pool.query(text, values);
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
