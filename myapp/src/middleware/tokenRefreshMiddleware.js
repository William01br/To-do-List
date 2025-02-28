import jwt from "jsonwebtoken";
import { decrypt } from "../utils/crypto.js";

/**
 * Middleware to verify the expiration and validity of a refresh token stored in a signed cookie.
 * The refresh token is decrypted, verified, and decoded to extract the user ID.
 * If the token is valid, the user ID and decrypted refresh token are attached to the request object (`req.userId` and `req.refreshToken`),
 * and the request is passed to the next middleware.
 * If the token is missing, expired, or invalid, an appropriate error response is sent.
 *
 * @function verifyExpirationToken
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @returns {void} If the token is valid, the request is passed to the next middleware.
 *                Otherwise, an error response is sent with an appropriate status code and message.
 *
 * @throws {Error} If the token is missing, expired, or invalid, an error response is sent:
 *                 - 401 Unauthorized: If the refresh token is missing or expired.
 *                 - 500 Internal Server Error: If an unexpected error occurs during decryption or verification.
 */
const verifyExpirationToken = (req, res, next) => {
  try {
    // Extract the encrypted token from the signed cookies.
    const refreshToken = req.signedCookies.refreshToken;

    if (!refreshToken)
      return res
        .status(401)
        .json({ message: "refresh token not found or expired" });

    // Decrypting the refresh token recovered by cookies
    const decryptedRefreshToken = decrypt(refreshToken);

    const decoded = jwt.verify(
      decryptedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    req.userId = decoded.userId;
    req.refreshToken = decryptedRefreshToken;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export default verifyExpirationToken;
