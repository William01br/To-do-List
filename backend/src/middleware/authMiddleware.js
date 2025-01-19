/**
 * Middleware for verify and auth users for acess protect routes.
 * Furthermore, verify and auth the token for change the password, too.
 */

import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized: token not found" });

  const token = authHeader.split(" ")[1];

  try {
    // verifiy if the token is temporary or acess.
    let decoded;
    if (req.temporarySession) {
      decoded = jwt.verify(token, process.env.TEMPORARY_VERIFICATION_TOKEN);
    } else {
      decoded = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
    }

    if (!decoded)
      return res.status(403).json({ message: "Forbidden: token invalid" });

    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res
        .status(403)
        .json({ message: "Token expired", expiredAt: err.expiredAt });

    if (err.name === "JsonWebTokenError")
      return res.status(403).json({ message: "Invalid signature" });
    return res.status(500).json({ message: err.message });
  }
};

export default authenticateToken;
