import express from "express";

import { createList } from "../controllers/listController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createList);

export default router;
