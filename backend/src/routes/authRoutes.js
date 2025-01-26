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
 * Initiates Google OAuth authentication.
 * This route handler starts the Google OAuth process when a user navigates to this endpoint.
 *
 * @route GET /google
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} This function doesn't return anything. It redirects the user to Google's authentication page.
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * Handles the Google OAuth callback route.
 * This route is called by Google after a user has authenticated with their Google account.
 * It uses Passport to authenticate the user and then calls the loginByOAuth function to complete the login process.
 *
 * @route GET /google/callback
 * @param {string} path - The route path ("/google/callback")
 * @param {function} passportMiddleware - Passport authentication middleware for Google strategy
 * @param {function} loginByOAuth - Controller function to handle OAuth login
 * @returns {void} This route doesn't return a value directly, but triggers the authentication process
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  loginByOAuth
);

router.post("/login", login);

/**
 * Refreshes an access token using a valid refresh token.
 * This route is protected by middleware to ensure the refresh token is valid and not expired.
 * The new access token and refresh token are sent to the client via cookies.
 *
 * @route POST /refresh-token
 * @function
 * @memberof module:routes/auth
 * @param {string} path - The route path ("/refresh-token").
 * @param {Function[]} middleware - Middleware functions to execute before the route handler.
 * @param {Function} verifyExpirationToken - Middleware to verify if the refresh token is expired.
 * @param {Function} getAccessToken - Middleware to generate and set the new access token in cookies.
 * @returns {Object} Response object with a message confirming that the token have been sent via cookies.
 */
router.post("/refresh-token", verifyExpirationToken, getAcessToken);

export default router;
