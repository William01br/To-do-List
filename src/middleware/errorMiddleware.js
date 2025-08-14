import HttpError from "../errors/HttpError.js";

export const errorHandler = (err, req, res, next) => {
  const { statusCode, message, context } = err;
  if (err instanceof HttpError) {
    if (!process.env.NODE_ENV === "test")
      console.warn(
        JSON.stringify({ code: err.statusCode, message: err.message }, null, 2),
        err.stack
      );
    res.status(statusCode).json({
      errors: [
        {
          message: message,
          context: context,
        },
      ],
    });
    return;
  }
  console.error(err);
  res.status(500).json({ errors: [{ message: "Something went wrong" }] });
  return;
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
  return;
};
