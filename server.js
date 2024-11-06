import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import login from "./routes/logins.js";
import { pool } from "./models/db.js";
const PORT = process.env.PORT || 3000;
const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const testDbConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("connection successful:", result.rows);
  } catch (err) {
    console.error("error connecting:", err);
  }
};
testDbConnection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
