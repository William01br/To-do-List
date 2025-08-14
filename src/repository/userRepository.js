import { pool } from "../config/db.js";

const emailExists = async (email) => {
  const text = "SELECT * FROM users WHERE email = $1";

  const result = await pool.query(text, [email]);
  return result;
};

const verifyExpirationToken = async (resetToken, dateNow) => {
  const text =
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2";
  const values = [resetToken, dateNow];

  const result = await pool.query(text, values);
  return result;
};

const create = async (username, email, passwordHashed, avatarUrl) => {
  const text =
    "INSERT INTO users(username, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar, created_at";
  const values = [username, email, passwordHashed, avatarUrl];

  const result = await pool.query(text, values);
  return result;
};

const updateAvatar = async (url, userId) => {
  const text = "UPDATE users SET avatar = $1 WHERE id = $2";
  const values = [url, userId];

  const result = await pool.query(text, values);
  return result;
};

const updateResetPasswords = async (resetToken, userEmail, dateExpires) => {
  const text =
    "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3";
  const values = [resetToken, dateExpires, userEmail];

  const result = await pool.query(text, values);
  return result;
};

const updatePassword = async (passwordHashed, resetToken) => {
  const text =
    "UPDATE users SET password = $1, reset_password_token = $2, reset_password_expires = $3 WHERE reset_password_token = $4";
  const values = [passwordHashed, null, null, resetToken];

  const result = await pool.query(text, values);
  return result;
};

const getAllByUserId = async (userId) => {
  const text = `
    SELECT 
    u.id,
    u.username,
    u.email,
    u.avatar,
    u.created_at
    FROM
        users u
    WHERE 
        u.id = $1;`;

  const result = await pool.query(text, [userId]);
  return result;
};

const deleteByUserId = async (userId) => {
  const text = "DELETE FROM users WHERE id = $1";
  await pool.query(text, [userId]);
};

const findByOauthId = async (oauthId) => {
  const text = "SELECT * FROM users WHERE oauth_id = $1";

  const result = await pool.query(text, [oauthId]);
  return result;
};

const insertUserByOAuth = async (
  username,
  email,
  oauthProvider,
  oauthId,
  avatar
) => {
  const text =
    "INSERT INTO users (username, email, oauth_provider, oauth_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *";
  const values = [username, email, oauthProvider, oauthId, avatar];

  const result = await pool.query(text, values);
  return result;
};

const getByEmail = async (email) => {
  const text = "SELECT * FROM users WHERE email = $1";

  const result = await pool.query(text, [email]);
  return result;
};

export default {
  create,
  emailExists,
  updateAvatar,
  updateResetPasswords,
  verifyExpirationToken,
  updatePassword,
  getAllByUserId,
  deleteByUserId,
  findByOauthId,
  insertUserByOAuth,
  getByEmail,
};
