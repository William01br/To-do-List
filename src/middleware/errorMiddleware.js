/**
 * Express error-handling middleware.
 * Logs the error to the console and sends a structured error response to the client.
 * If the error has a `statusCode` property, it is used as the HTTP status code; otherwise, a default status code of 500 (Internal Server Error) is used.
 * If the error has a `message` property, it is used as the error message; otherwise, a default message of "Internal Server Error" is used.
 *
 * @function errorHandler
 * @param {Error} err - The error object passed to the middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @returns {void} Sends a JSON response with the error status and message.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

export default errorHandler;
