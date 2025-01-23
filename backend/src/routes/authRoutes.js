import express from "express";
import passport from "passport";

import { login, getAcessToken } from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import verifyExpirationToken from "../middleware/tokenRefreshMiddleware.js";

// import all configs of passport
import "../config/passport.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;
    res.status(200).json(user);
  }
);

router.post("/login", login);

router.post("/refresh-token", verifyExpirationToken, getAcessToken);

router.get("/protected", authenticateToken, (req, res) => {
  res.send("Hello from protected route!");
});

export default router;
