import jwt from "jsonwebtoken";
import UnauthorizedErrorHttp from "../errors/UnauthorizedError.js";

const authenticateToken = (req, res, next) => {
  // Extract the token from the signed cookies
  const token = req.signedCookies.acessToken;

  if (!token)
    throw new UnauthorizedErrorHttp({
      message: "Unauthorized: token not found or expired",
    });

  try {
    const decoded = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      console.warn(
        JSON.stringify({ code: 401, message: err.message }, null, 2),
        err.stack
      );
      res.status(401).json({ message: "JWT invalid" });
      return;
    }
    next(err);
  }
};

export default authenticateToken;
