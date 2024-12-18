import express from "express";
import { register } from "../controllers/userController.js";
import { credentialsIsValid } from "../middleware/credentialsMiddleware.js";

const router = express.Router();

router.post("/register", credentialsIsValid, register);

export default router;
