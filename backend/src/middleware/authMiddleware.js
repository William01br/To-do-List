/**
 * Middleware for verify and auth users for acess protect routes.
 * Furthermore, verify and auth the token for change the password, too.
 */

import jwt from "jsonwebtoken";
import { decrypt } from "../utils/crypto.js";

const authenticateToken = (req, res, next) => {
  try {
    const encryptedToken = req.signedCookies.acessToken;

    if (!encryptedToken)
      return res.status(401).json({ message: "Unauthorized: token not found" });

    // decrypt the token encrypted in the cookies and send only the Buffer.
    const decryptedToken = decrypt(encryptedToken);

    // verify if the token is temporary or acess.
    let decoded;
    if (req.temporarySession) {
      decoded = jwt.verify(
        decryptedToken,
        process.env.TEMPORARY_VERIFICATION_TOKEN
      );
    } else {
      decoded = jwt.verify(decryptedToken, process.env.ACESS_TOKEN_SECRET);
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
