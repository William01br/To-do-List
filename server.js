import express from "express";
import { pool } from "./models/db.js";
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
    [name, email, password],
    (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).send("Error inserting user");
      }
      console.log("User inserted successfully:", result.rows);
      return res.status(201).send("User registered successfully");
    }
  );
});

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
