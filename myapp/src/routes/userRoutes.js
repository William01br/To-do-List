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
 * Route to fetch user data by ID.
 * This route is protected by the `authenticateToken` middleware, which ensures that only authenticated users can access it.
 * If authentication is successful, the `getUserDataById` function is called to retrieve and return the user's data.
 *
 * @name Get User Data
 * @route {GET} /
 * @middleware authenticateToken - Middleware to verify the user's access token and authenticate the request.
 * @handler getUserDataById - Function to fetch and return the user's data.
 *
 * @returns {Object} A JSON response containing the user's data.
 */
router.get("/", authenticateToken, getUserDataById);

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Registra um novo usuário.
 *     description: |
 *       Registra um novo usuário com username, email e senha. O middleware valida se:
 *       - Todos os campos (username, email e password) foram enviados.
 *       - O email está em um formato válido.
 *       - A senha contém letras maiúsculas, minúsculas, números e pelo menos 8 caracteres.
 *     tags:
 *       - User
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
 *                 example: "john.doe@test.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Usuário registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "successfully registered"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@test.com"
 *       400:
 *         description: Falha na validação dos campos (campos faltando ou com formato inválido).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields needed be completed"
 *       409:
 *         description: Conflito - Email já está registrado.
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
 *         description: Erro interno do servidor.
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
 * Route to upload a single file (e.g., an image).
 * This route is protected by the `authenticateToken` middleware, which ensures that only authenticated users can access it.
 * The `upload.single("file")` middleware handles the file upload process, and the `uploadImage` function processes the uploaded file.
 *
 * @name Upload File
 * @route {POST} /upload
 * @middleware authenticateToken - Middleware to verify the user's access token and authenticate the request.
 * @middleware upload.single("file") - Middleware to handle the upload of a single file. The file is expected to be provided in the `file` field of the request.
 * @handler uploadImage - Function to process the uploaded file and return a response.
 *
 * @returns {Object} A JSON response indicating the success of the file upload process and containing the image url.
 */
router.post("/upload", authenticateToken, upload.single("file"), uploadImage);

/**
 * Route to handle a "forgot password" request.
 * This route triggers the process to reset a user's password by sending a password reset link to their registered email address.
 * The `forgotPassword` function handles the logic for generating and sending the reset link.
 *
 * @name Forgot Password
 * @route {POST} /forgot-password
 * @handler forgotPassword - Function to handle the "forgot password" request and send a reset link.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} A JSON response indicating the success of the request.
 */
router.post("/forgot-password", forgotPassword);

/**
 * Route to reset a user's password using a valid reset token.
 * This route allows users to reset their password by providing a new password and a valid reset token (received via email).
 * The `resetPassword` function handles the logic for validating the token and updating the user's password.
 *
 * @name Reset Password
 * @route {POST} /reset-password/:token
 * @param {string} token - The reset token included in the URL as a parameter. This token is used to verify the user's identity.
 * @handler resetPassword - Function to handle the password reset process.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} A JSON response indicating the success of the password reset process.
 */
router.post("/reset-password/:token", resetPassword);

/**
 * Route to delete a user's account.
 * This route is protected by the `authenticateToken` middleware, which ensures that only authenticated users can access it.
 * The `deleteAccount` function handles the logic for deleting the user's account and associated data.
 *
 * @name Delete Account
 * @route {DELETE} /remove-account
 * @middleware authenticateToken - Middleware to verify the user's access token and authenticate the request.
 * @handler deleteAccount - Function to handle the account deletion process.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Object} A JSON response indicating the success of the account deletion process.
 */
router.delete("/remove-account", authenticateToken, deleteAccount);

export default router;
