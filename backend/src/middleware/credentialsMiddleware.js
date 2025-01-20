import { isEmailValid, isPasswordValid } from "../utils/credentials.js";

export const credentialsIsValid = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields needed be completed" });
  }

  if (!isEmailValid(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (!isPasswordValid(password)) {
    return res.status(400).json({
      message:
        "password must contain uppercase letters, lowercase letters, numbers and at least 8 characters",
    });
  }
  req.credentials = { username, email, password };
  next();
};
