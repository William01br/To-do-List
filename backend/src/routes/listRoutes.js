import express from "express";

import {
  createList,
  getAllLists,
  getListByListId,
  updateList,
  deleteList,
} from "../controllers/listController.js";
import {
  getAllTasks,
  createTask,
  getTaskByTaskId,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAllLists);

router.get("/:listId", authenticateToken, getListByListId);

router.post("/create", authenticateToken, createList);

router.patch("/update/:listId", authenticateToken, updateList);

router.delete("/remove/:listId", authenticateToken, deleteList);

//**
// ROUTES FOR TASKS
// */

router.get("/:listId/tasks", authenticateToken, getAllTasks);

router.get("/:listId/tasks/:taskId", authenticateToken, getTaskByTaskId);

router.post("/:listId/tasks", authenticateToken, createTask);

router.patch("/:listId/tasks/:taskId", authenticateToken, updateTask);

router.delete("/:listId/tasks/:taskId", authenticateToken, deleteTask);

export default router;
