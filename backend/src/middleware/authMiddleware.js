import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const token = req.header("authorization");
  if (!token) return res.status(404).json({ message: "Acess denied" });

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token not valid" });
  }
};

export default authenticateToken;
