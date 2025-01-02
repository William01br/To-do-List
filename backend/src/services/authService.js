import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

const login = async (email, password) => {
  try {
    const text = "SELECT * FROM users WHERE email = $1";
    const values = [email];

    const result = await pool.query(text, values);
    const user = result.rows[0];
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
      expiresIn: "12h",
    });
    return token;
  } catch (err) {
    console.error("Error logging in user:", err);
    return null;
  }
};

export default { login };
