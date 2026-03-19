import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/user.model.js";
import { createHttpError } from "../utils/httpError.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Authorization token is required.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.sub);

    if (!user) {
      throw createHttpError(401, "Invalid token user.");
    }

    if (user.status !== "active") {
      throw createHttpError(403, "User account is not active.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      next(createHttpError(401, "Invalid or expired token."));
      return;
    }

    next(error);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      next(createHttpError(401, "Authentication is required."));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createHttpError(403, "Insufficient permissions."));
      return;
    }

    next();
  };
};

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      next();
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub);

    if (!user || user.status !== "active") {
      req.user = null;
      next();
      return;
    }

    req.user = user;
    next();
  } catch (_error) {
    req.user = null;
    next();
  }
};
