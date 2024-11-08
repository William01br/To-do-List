import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool, insertUser, selectEmailUser } from "../models/db.js";
const SECRET_KEY = process.env.SECRET_KEY;

// registra novo usuário
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await insertUser(username, email, hashedPassword);

    res.status(201).json({ message: "user successfully added" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// login de usuário
const login = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const result = await selectEmailUser(email);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "5m",
    });
    // res.json({ message: "Login successful" });
    res.json({ token: token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in user" });
  }
};

// remove usuário logado
// const remove = async (req, res) => {
//   res.json({ message: "Logged in and prepared for removed" });
// };

export { register, login };
