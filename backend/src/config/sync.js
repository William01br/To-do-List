import { pool } from "./database.js";
import user from "../models/user.js";
import list from "../models/list.js";
import task from "../models/task.js";
import refreshTokens from "../models/refreshTokens.js";

const execute = async () => {
  try {
    await pool.query(user);
    await pool.query(list);
    await pool.query(task);
    await pool.query(refreshTokens);
    return true;
  } catch (err) {
    console.error("Error creating tables:", err.stack);
    throw new Error("Error creating tables:", err.stack);
  }
};

export default execute;
