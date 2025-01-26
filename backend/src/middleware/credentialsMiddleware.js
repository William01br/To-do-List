import { isEmailValid, isPasswordValid } from "../utils/credentials.js";

/**
 * Middleware to validate user credentials (username, email, and password) in the request body.
 * Checks if all required fields are present, validates the email format, and ensures the password meets complexity requirements.
 * If validation passes, the credentials are attached to the request object (`req.credentials`), and the request is passed to the next middleware.
 * If validation fails, an appropriate error response is sent.
 *
 * @function credentialsIsValid
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @returns {void} If validation passes, the request is passed to the next middleware.
 *                Otherwise, an error response is sent with an appropriate status code and message.
 *
 * @throws {Error} If validation fails, an error response is sent:
 *                 - 400 Bad Request: If any required field is missing, the email format is invalid, or the password does not meet complexity requirements.
 */
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
