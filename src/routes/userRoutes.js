import multer from "multer";
import express from "express";

import {
  register,
  uploadImage,
  forgotPassword,
  resetPassword,
  getUserDataById,
  deleteAccount,
} from "../controllers/userController.js";
import { credentialsIsValid } from "../middleware/credentialsMiddleware.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer();

/**
 * @swagger
 * /user/:
 *   get:
 *     summary: Retrieve all user data by ID.
 *     description: |
 *       This endpoint returns all data associated with the authenticated user.
 *       The access token must be sent via an HTTP-only signed cookie.
 *     security:
 *       - AccessToken: []
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: User data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: "#/components/schemas/User"
 *       400:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad request"
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         description: Unauthorized - Token not found or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: token not found or expired"
 *       403:
 *         description: Forbidden - Invalid token signature.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid signature"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/", authenticateToken, getUserDataById);

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user.
 *     description: Creates a new user account and initializes the default list for the user.
 *     tags:
 *       - User
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *     responses:
 *       200:
 *         description: User successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "successfully registered"
 *                 data:
 *                   $ref: "#/components/schemas/User"
 *       400:
 *         description: Invalid or missing request body parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields needed be completed"
 *       409:
 *         description: Email address is already registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "conflict"
 *                 message:
 *                   type: string
 *                   example: "The email address is already registered"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/register", credentialsIsValid, register);

/**
 * @swagger
 * /user/upload:
 *   post:
 *     summary: Upload user avatar.
 *     description: Uploads an image file as the user's avatar. The file is processed via Multer and stored in the cloud.
 *     tags:
 *       - User
 *     security:
 *       - AccessToken: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: O arquivo a ser enviado.
 *     responses:
 *       200:
 *         description: Avatar successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "avatar updated successfully"
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: "https://cloudinary.com/my-uploaded-image.jpg"
 *       400:
 *         description: No file uploaded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File required"
 *       401:
 *         description: Unauthorized - No valid access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: token not found or expired"
 *       403:
 *         description: Invalid token signature.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid signature"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/upload", authenticateToken, upload.single("file"), uploadImage);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Request a password reset link via email.
 *     description: This route sends a password reset link to the user's email if the email is registered.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user requesting a password reset.
 *                 example: "johndoe@example.com"
 *     responses:
 *       200:
 *         description: Email sent successfully with the password reset link.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent"
 *       400:
 *         description: Email is required or not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email not found"
 *       500:
 *         description: Internal server error when sending the reset email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /user/reset-password/{token}:
 *   post:
 *     summary: Reset user password using a reset token.
 *     description: This route allows a user to reset their password by providing a reset token and a new password.
 *     tags:
 *       - User
 *     parameters:
 *       - name: token
 *         in: path
 *         description: The password reset token, which is required to authenticate the request.
 *         required: true
 *         schema:
 *           type: string
 *           example: "d34db33f-token"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new password to set for the user.
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Invalid input (e.g., token expired or new password doesn't meet requirements).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad request"
 *                 message:
 *                   type: string
 *                   example: "Password must contain uppercase letters, lowercase letters, numbers, and at least 8 characters"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /user/remove-account:
 *   delete:
 *     summary: Remove user account
 *     description: Endpoint to remove the authenticated user's account. The access token is sent via a signed cookie.
 *     tags:
 *       - User
 *     security:
 *       - AccessToken: []
 *     responses:
 *       200:
 *         description: User successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       401:
 *         description: Unauthorized - token not found or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: token not found or expired"
 *       403:
 *         description: Invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid signature"
 *       500:
 *         description: Internal server error or user not deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not deleted"
 */
router.delete("/remove-account", authenticateToken, deleteAccount);

export default router;
