import { pool } from "../config/db.js";

const create = async (userId, hashedRefreshToken, expiresAt, updatedAt) => {
  const text =
    "INSERT INTO refresh_tokens (user_id, refresh_token, expires_at, updated_at) VALUES ($1, $2, $3, $4)";
  const values = [userId, hashedRefreshToken, expiresAt, updatedAt];

  await pool.query(text, values);
};

const findRefreshTokenByUserId = async (userId) => {
  const text =
    "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1";

  const result = await pool.query(text, [userId]);
  return result;
};

const deleteByUserId = async (userId) => {
  const text = "DELETE FROM refresh_tokens WHERE user_id = $1";

  await pool.query(text, [userId]);
};

export default {
  create,
  findRefreshTokenByUserId,
  deleteByUserId,
};
