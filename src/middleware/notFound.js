/**
 * Express middleware to handle requests to undefined routes.
 * Sends a 404 (Not Found) response with a JSON message indicating that the requested resource was not found.
 * After sending the response, it calls the `next` middleware function to continue the middleware chain.
 *
 * @function notFound
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @returns {void} Sends a JSON response with a 404 status and a "Not Found" message.
 */
export const notFound = (req, res, next) => {
  res.status(404).json({ message: "Not Found" });
  next();
};
