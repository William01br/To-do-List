import { pool } from "../config/db.js";

const countByUserId = async (userId) => {
  const text = "SELECT COUNT(*) FROM lists WHERE user_id = $1";
  const values = [userId];

  const result = await pool.query(text, values);
  return result;
};

const createList = async (listName, userId, isProtected = false) => {
  const text =
    "INSERT INTO lists (name_list, user_id, is_protected) VALUES ($1, $2, $3) RETURNING *";
  const values = [listName, userId, isProtected];

  const result = await pool.query(text, values);
  return result;
};

const getAllByUserId = async (userId, limit, offset) => {
  const text = `
    SELECT * 
        FROM lists 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;`;
  const values = [userId, limit, offset];

  const result = await pool.query(text, values);
  return result;
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
  return result;
};

const updateByListId = async (listId, userId, nameList) => {
  const text = `
    UPDATE lists SET name_list = $1 WHERE id = $2 AND user_id = $3 AND is_protected = $4`;
  const values = [nameList, listId, userId, false];

  const result = await pool.query(text, values);
  return result;
};

const deleteByListId = async (listId, userId) => {
  const text = `DELETE FROM lists WHERE id = $1 AND user_id = $2 AND is_protected = $3`;
  const values = [listId, userId, false];

  await pool.query(text, values);
};

const listExists = async (listId, userId) => {
  const text = `SELECT EXISTS (SELECT 1 FROM lists WHERE id = $1 AND user_id = $2)`;
  const values = [listId, userId];

  const result = await pool.query(text, values);
  return result;
};

export default {
  countByUserId,
  createList,
  getAllByUserId,
  getListByListId,
  updateByListId,
  deleteByListId,
  listExists,
};
