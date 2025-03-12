import express from "express";
import passport from "passport";

import {
  login,
  getAcessToken,
  loginByOAuth,
} from "../controllers/authController.js";
import verifyExpirationToken from "../middleware/tokenRefreshMiddleware.js";

// import all configs of passport
import "../config/passport.js";

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     description: >
 *       This endpoint redirects the user to Google's login page using Passport's Google Strategy.
 *       The requested scopes are "profile" and "email".
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects the user to Google's authentication page.
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: >
 *       This endpoint processes the callback after Google authentication.
 *       It logs in the user (or registers them if they don't exist) using OAuth,
 *       generates access and refresh tokens (which are sent via encrypted cookies),
 *       and returns the user data in JSON format.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successfully authenticated. Returns user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  loginByOAuth
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and issue access and refresh tokens.
 *     description: |
 *       This endpoint allows a user to log in using their email and password.
 *       If authentication is successful, access and refresh tokens are issued and stored in HTTP-only signed cookies.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
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
 *         description: Login successful. Tokens stored in cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successfully"
 *       400:
 *         description: Missing email or password in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "email and password are required"
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error or token generation failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "tokens not sent"
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Endpoint to generate a new access token using the refresh token provided via a signed cookie.
 *     tags:
 *       - Authentication
 *     security:
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Access token successfully recovered and set in the cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "acess Token recovered"
 *       401:
 *         description: Refresh token not found or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "refresh token not found or expired"
 *       500:
 *         description: Internal server error or failure in creating the access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "access token not created"
 */
router.post("/refresh-token", verifyExpirationToken, getAcessToken);

export default router;
