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

// Creates a new refresh (RF) and acess token and storage the RF. Therefore, deletes the old RF.
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
  try {
    const text = "SELECT * FROM users WHERE email = $1";
    const values = [email];

    const result = await pool.query(text, values);
    const user = result.rows[0];
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return user.id;
  } catch (err) {
    console.error("Error logging in user:", err);
    return null;
  }
};

// Receive a refresh token and creates a new acess token.
const getAcessToken = async (refreshToken, userId) => {
  try {
    const text =
      "SELECT refresh_token FROM refresh_tokens WHERE user_id = $1 AND revoked = false LIMIT 1";
    const values = [userId];

    const result = await pool.query(text, values);
    if (result.rows[0].lenght === 0 || !result) return null;

    const storedToken = result.rows[0].refresh_token;

    const isMatch = await bcrypt.compare(refreshToken, storedToken);
    if (!isMatch) return null;

    return generateAcessToken(userId);
  } catch (err) {
    console.error("Error refreshing token:", err);
    return null;
  }
};

const deleteRefreshToken = async (userId) => {
  try {
    const text = "DELETE FROM refresh_tokens WHERE user_id = $1";
    const values = [userId];

    await pool.query(text, values);
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
};
