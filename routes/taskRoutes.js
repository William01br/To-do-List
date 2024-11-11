import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { showAllTasks, createTask } from "../controllers/taskController.js";
const router = express.Router();

router.post("/tasks", authenticateToken, createTask);

router.get("/tasks", authenticateToken, showAllTasks);

export default router;
