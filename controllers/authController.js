import bcrypt from "bcrypt";
import jwt from "jwt";
import { pool, insertUser } from "../models/db.js";
const SECRET_KEY = process.env.SECRET_KEY;

// registra novo usuário
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // dá pra colocar o trecho em Models
    const result = await insertUser(username, email, hashedPassword);

    res.status(201).json({ message: "user successfully added" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
};
