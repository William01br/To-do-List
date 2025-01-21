import express from "express";

import {
  createList,
  getAllLists,
  getListByListId,
} from "../controllers/listController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAllLists);

router.get("/:listId", authenticateToken, getListByListId);

router.post("/create", authenticateToken, createList);

export default router;
