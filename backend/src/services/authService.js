import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

const generateAcessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACESS_TOKEN_SECRET, {
    expiresIn: "60s",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "240s",
  });
};

const hashRefreshToken = async (refreshToken) => {
  return await bcrypt.hash(refreshToken, 10);
};

const storeRefreshToken = async (userId, hashedRefreshToken) => {
  // const daysToMilliseconds = (days) => days * 24 * 60 * 60 * 1000;
  // teste --> days aqui são segundos!!!
  const daysToMilliseconds = (days) => days * 1000;

  const expiresAt = new Date(Date.now() + daysToMilliseconds(14));

  try {
    const text =
      "INSERT INTO refresh_tokens (userId, refreshToken, expiresAt) VALUES ($1, $2, $3) RETURNING id";
    const values = [userId, hashedRefreshToken, expiresAt];

    const result = await pool.query(text, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error storing refresh token:", err);
    throw new Error("Failed to store refresh token");
  }
};

const getTokens = async (userId) => {
  try {
    await deleteRefreshToken(userId);

    const acessToken = generateAcessToken(userId);

    const refreshToken = generateRefreshToken(userId);

    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    const idStoredRefreshToken = await storeRefreshToken(
      userId,
      hashedRefreshToken
    );

    return { refreshToken: refreshToken, acessToken: acessToken };
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

const getTokenRefresh = async (providedRefreshToken, providedUserId) => {
  try {
    const userId = providedUserId;
    console.log(userId);

    const text =
      "SELECT refreshtoken FROM refresh_tokens WHERE userId = $1 AND revoked = false LIMIT 1";
    const values = [userId];

    const result = await pool.query(text, values);
    if (result.rows[0].lenght === 0 || !result) return null;

    const storedToken = result.rows[0].refreshtoken;

    const isMatch = await bcrypt.compare(providedRefreshToken, storedToken);
    if (!isMatch) return null;

    return generateAcessToken(userId);
  } catch (err) {
    console.error("Error refreshing token:", err);
    return null;
  }
};

// value should be a token (string) or userId (number).
const deleteRefreshToken = async (value) => {
  try {
    let userId;
    if (typeof value === "number") {
      userId = value;
    } else {
      const decoded = jwt.decode(value, process.env.REFRESH_TOKEN_SECRET);
      userId = decoded.userId;
    }

    const text = "DELETE FROM refresh_tokens WHERE userId = $1";
    const values = [userId];

    const result = await pool.query(text, values);
    return result.rowCount;
  } catch (err) {
    console.error("Error deleting refresh token:", err);
    throw new Error("refresh token not deleted");
  }
};

export default { login, getTokenRefresh, getTokens, deleteRefreshToken };
