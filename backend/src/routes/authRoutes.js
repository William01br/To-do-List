import express from "express";
import { login, tokenRefresh } from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", login);

router.post("/refresh-token", tokenRefresh);

router.get("/protected", authenticateToken, (req, res) => {
  res.send("Hello from protected route!");
});

export default router;
