import jwt from "jsonwebtoken";
import UnauthorizedErrorHttp from "../errors/UnauthorizedError.js";

const verifyExpirationToken = (req, res, next) => {
  // Extract the token from the signed cookies.
  const refreshToken = req.signedCookies.refreshToken;
  console.log(refreshToken);

  if (!refreshToken)
    throw new UnauthorizedErrorHttp({
      message: "Refresh token not found or expired",
    });

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  req.userId = decoded.userId;
  req.refreshToken = refreshToken;
  next();
};

export default verifyExpirationToken;
