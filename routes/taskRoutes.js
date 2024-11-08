import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { showAllTasks } from "../controllers/taskController.js";
const router = express.Router();

router.get("/tasks", authenticateToken, showAllTasks);

export default router;
