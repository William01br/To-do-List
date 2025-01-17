import jwt from "jsonwebtoken";
import authService from "../services/authService.js";

const verifyExpirationToken = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const result = await authService.deleteRefreshToken(token);
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
