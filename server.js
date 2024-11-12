import express from "express";
import { pool } from "./models/db.js";
import authRouters from "./routes/authRoutes.js";
import taskRouters from "./routes/taskRoutes.js";
import { notFound } from "./middleware/notFound.js";
const PORT = process.env.PORT || 3000;
const app = express();

app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouters);

app.use("/api", taskRouters);

app.use(notFound);

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
