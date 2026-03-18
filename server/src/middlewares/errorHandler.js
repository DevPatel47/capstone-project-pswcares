import { MulterError } from "multer";

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof MulterError) {
    const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    res.status(statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { code: err.code }),
    });
    return;
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
