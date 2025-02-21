/**
 * Middleware for verify and auth users for acess protect routes.
 * Furthermore, verify and auth the token for change the password, too.
 */

import jwt from "jsonwebtoken";
import { decrypt } from "../utils/crypto.js";

/**
 * Middleware to authenticate a user using an encrypted access token stored in a signed cookie.
 * The token is decrypted, verified, and decoded to extract the user ID. If the token is valid,
 * the user ID is attached to the request object (`req.userId`), and the request is passed to the next middleware.
 * If the token is invalid, expired, or missing, an appropriate error response is sent.
 *
 * @function authenticateToken
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @returns {void} If the token is valid, the request is passed to the next middleware.
 *                Otherwise, an error response is sent with an appropriate status code and message.
 *
 * @throws {Error} If the token is missing, expired, or invalid, an error response is sent:
 *                 - 401 Unauthorized: If the token is missing or expired.
 *                 - 403 Forbidden: If the token is invalid or has an invalid signature.
 *                 - 500 Internal Server Error: If an unexpected error occurs.
 */
const authenticateToken = (req, res, next) => {
  try {
    // Extract the encrypted token from the signed cookies
    const encryptedToken = req.signedCookies.acessToken;

    if (!encryptedToken)
      return res
        .status(401)
        .json({ message: "Unauthorized: token not found or expired" });

    // decrypt the token.
    const decryptedToken = decrypt(encryptedToken);

    const decoded = jwt.verify(decryptedToken, process.env.ACESS_TOKEN_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    // if (err instanceof jwt.JsonWebTokenError)
    if (err.name === "JsonWebTokenError")
      return res.status(403).json({ message: "Invalid signature" });
    return res.status(500).json({ message: err.message });
  }
};

export default authenticateToken;
