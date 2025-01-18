import multer from "multer";
import express from "express";

import { register, uploadImage } from "../controllers/userController.js";
import { credentialsIsValid } from "../middleware/credentialsMiddleware.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.post("/register", credentialsIsValid, register);

// upload the avatar
router.post("/upload", authenticateToken, upload.single("file"), uploadImage);

export default router;
