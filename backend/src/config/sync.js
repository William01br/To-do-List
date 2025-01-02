import { pool } from "./database.js";
import user from "../models/user.js";
import list from "../models/list.js";
import task from "../models/task.js";

const execute = async () => {
  try {
    await pool.connect();
    await pool.query(user);
    await pool.query(list);
    await pool.query(task);
    return true;
  } catch (err) {
    console.error(err.stack);
    return false;
  } finally {
    await pool.end();
  }
};

export default execute;
