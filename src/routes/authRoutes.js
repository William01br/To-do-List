import express from "express";
import { register, login, remove } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.delete("/remove", authenticateToken, remove);

export default router;
