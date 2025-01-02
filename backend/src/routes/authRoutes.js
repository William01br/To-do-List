import express from "express";
import login from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", login);

export default router;
