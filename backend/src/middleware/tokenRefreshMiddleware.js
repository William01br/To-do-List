import jwt from "jsonwebtoken";
import authService from "../services/authService.js";
import { decrypt } from "../utils/crypto.js";

const verifyExpirationToken = async (req, res, next) => {
  try {
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
    return res.status(500).json({ message: err.message });
  }
};

export default verifyExpirationToken;
