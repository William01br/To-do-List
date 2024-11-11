import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  showAllTasks,
  createTask,
  updateTask,
} from "../controllers/taskController.js";
const router = express.Router();

router.post("/tasks", authenticateToken, createTask);

router.get("/tasks", authenticateToken, showAllTasks);

router.patch("/tasks/:id", authenticateToken, updateTask);

export default router;
