/**
 * Middleware for verify wich session is the user.
 * If the user is logged Through the OAuth 2.0, him can't change the password.
 */

import { pool } from "../config/database.js";

const verifySessionUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    console.log(userId);

    const text = "SELECT * FROM users WHERE id = $1 AND password IS NOT NULL";
    const value = [userId];

    const result = await pool.query(text, value);
    console.log(result);
    if (result.rows.length === 0)
      return res.status(403).json({
        message:
          "The User cannot change the password, because the session is through OAuth 2.0",
      });
    next();
  } catch (err) {
    console.error("Error verifying session user in DB:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export default verifySessionUser;
