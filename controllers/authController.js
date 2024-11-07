import bcrypt from "bcrypt";
import jwt from "jwt";
import { pool } from "../models/db.js";

// app.post("/api/register", (req, res) => {
//   const { name, email, password } = req.body;

//   pool.query(
//     "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
//     [name, email, password],
//     (err, result) => {
//       if (err) {
//         console.error("Error inserting user:", err);
//         return res.status(500).send("Error inserting user");
//       }
//       console.log("User inserted successfully:", result.rows);
//       return res.status(201).send("User registered successfully");
//     }
//   );
// });
