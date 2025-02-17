/**
 * auth Service
 * Resolve all deeps operations of the auth Controller, such as generating tokens, interacting with database and encripting the data.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

const generateAcessToken = (userId) =>
  jwt.sign({ userId }, process.env.ACESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

const hashRefreshToken = async (refreshToken) =>
  await bcrypt.hash(refreshToken, 10);

/**
 * Stores a hashed refresh token in the database for a specific user.
 * The refresh token is associated with an expiration date (7 days from now) and a last updated timestamp.
 *
 * @async
 * @function storeRefreshToken
 * @param {string} userId - The ID of the user for whom the refresh token is being stored.
 * @param {string} hashedRefreshToken - The hashed refresh token to store in the database.
 * @returns {Promise<void>} A promise that resolves when the refresh token is successfully stored.
 * @throws {Error} If the database operation fails, an error is thrown with the message "Failed to store refresh token".
 *
 */
const storeRefreshToken = async (userId, hashedRefreshToken) => {
  const daysToMilliseconds = (days) => days * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + daysToMilliseconds(7));
  const updatedAt = new Date(Date.now());

  try {
    const text =
      "INSERT INTO refresh_tokens (user_id, refresh_token, expires_at, updated_at) VALUES ($1, $2, $3, $4)";
    const values = [userId, hashedRefreshToken, expiresAt, updatedAt];

    await pool.query(text, values);
  } catch (err) {
    console.error("Error storing refresh token:", err);
    throw new Error("Failed to store refresh token");
  }
};

/**
 * Generates and returns a new access token and refresh token for a specific user.
 * This function also handles the deletion of any existing refresh token for the user,
 * hashes the new refresh token, and stores it in the database.
 *
 * @async
 * @function getTokens
 * @param {string} userId - The ID of the user for whom the tokens are being generated.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} A promise that resolves to an object containing the new access token and refresh token.
 * @throws {Error} If any step in the token generation process fails, an error is thrown with the message "Failed to create tokens".
 */
const getTokens = async (userId) => {
  try {
    await deleteRefreshToken(userId);

    const acessToken = generateAcessToken(userId);

    const refreshToken = generateRefreshToken(userId);

    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    await storeRefreshToken(userId, hashedRefreshToken);

    return { acessToken: acessToken, refreshToken: refreshToken };
  } catch (err) {
    console.error("Error creating tokens:", err);
    throw new Error("Failed to create tokens");
  }
};

const login = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user || user.lenght === 0) return null;

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return null;

  return user.id;
};

const getUserByEmail = async (email) => {
  try {
    const text = "SELECT * FROM users WHERE email = $1";

    const result = await pool.query(text, [email]);
    return result.rows[0];
  } catch (err) {
    console.error("Error getting user data by email:", err);
    throw new Error("Error getting user data by email");
  }
};

// Receive a refresh token and creates a new acess token.
const getAcessToken = async (refreshToken, userId) => {
  const storedToken = await getRefreshTokenByUserId(userId);
  if (!storedToken || storedToken.lenght === 0) return null;

  const isMatch = await bcrypt.compare(refreshToken, storedToken.refresh_token);
  if (!isMatch) return null;

  return generateAcessToken(userId);
};

const getRefreshTokenByUserId = async (userId) => {
  try {
    const text =
      "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1";

    const result = await pool.query(text, [userId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error getting refresh token by userId:", err);
    throw new Error("Error getting refresh token by userId");
  }
};

// deletes the refresh token of specific user storaged in database
const deleteRefreshToken = async (userId) => {
  try {
    const text = "DELETE FROM refresh_tokens WHERE user_id = $1";

    await pool.query(text, [userId]);
  } catch (err) {
    console.error("Error deleting refresh token:", err);
    throw new Error("refresh token not deleted");
  }
};

export default {
  login,
  getAcessToken,
  getTokens,
  deleteRefreshToken,
  getUserByEmail,
  getRefreshTokenByUserId,
  generateAcessToken,
};
