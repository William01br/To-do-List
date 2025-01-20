import multer from "multer";
import express from "express";

import {
  register,
  uploadImage,
  verifyPassword,
  updatePassword,
  getUserDataById,
  deleteAccount,
} from "../controllers/userController.js";
import { credentialsIsValid } from "../middleware/credentialsMiddleware.js";
import authenticateToken from "../middleware/authMiddleware.js";
import verifySessionUser from "../middleware/verifySessionUserMiddleware.js";

const router = express.Router();
const upload = multer();

router.get("/", authenticateToken, getUserDataById);

router.post("/register", credentialsIsValid, register);

// upload the avatar
router.post("/upload", authenticateToken, upload.single("file"), uploadImage);

router.post(
  "/verify-password",
  authenticateToken,
  verifySessionUser,
  verifyPassword
);

router.patch(
  "/change-password",
  (req, res, next) => {
    req.temporarySession = true;
    next();
  },
  authenticateToken,
  updatePassword
);

router.delete("/remove-account", authenticateToken, deleteAccount);

export default router;
