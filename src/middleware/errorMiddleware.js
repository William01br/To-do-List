export const errorHandler = (err, req, res, next) => {
  console.error(
    JSON.stringify({ message: err.message, code: err.statusCode }, null, 2),
    err.stack
  );
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || "Something went wrong";
  res.status(errStatus).json({
    sucess: false,
    status: errStatus,
    message: errMsg,
  });
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
  return;
};
