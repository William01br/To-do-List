import jwt from "jsonwebtoken";
import authService from "../services/authService.js";
import { decrypt } from "../utils/crypto.js";

const verifyExpirationToken = async (req, res, next) => {
  const refreshToken = req.signedCookies.refreshToken;

  // Decrypting the refresh token recovered by cookies
  const decryptedRefreshToken = decrypt(refreshToken);

  if (!refreshToken)
    return res.status(401).json({ message: "refresh token is required" });

  try {
    const decoded = jwt.verify(
      decryptedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    req.userId = decoded.userId;
    req.refreshToken = decryptedRefreshToken;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const result = await authService.deleteRefreshToken(
        decryptedRefreshToken
      );
      return res.status(403).json({
        message: "Refresh Token expired",
        expiredAt: err.expiredAt,
        deleted: result,
      });
    }
    return res.status(500).json({ message: err.message });
  }
};

export default verifyExpirationToken;
