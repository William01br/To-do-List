import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

const register = async (name, username, email, password) => {
  try {
    const avatarUrl =
      "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

    const passwordHashed = await bcrypt.hash(password, 10);
    console.log(passwordHashed);

    const text =
      "INSERT INTO users(name, username, email, password, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, avatar, createdAt";
    const values = [name, username, email, passwordHashed, avatarUrl];

    const result = await pool.query(text, values);
    console.log(result.rows[0]);

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") return 23505;
    console.error("Error registering user:", err);
  }
};

export default { register };
