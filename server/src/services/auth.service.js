import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User, { USER_ROLES } from "../models/user.model.js";
import { createHttpError } from "../utils/httpError.js";

const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    throw createHttpError(400, "Name, email, and password are required.");
  }

  if (String(password).length < 8) {
    throw createHttpError(400, "Password must be at least 8 characters.");
  }

  if (role && !USER_ROLES.includes(role)) {
    throw createHttpError(400, "Invalid role.");
  }

  if (role === "admin") {
    throw createHttpError(
      403,
      "Admin registration is disabled. Use the secure admin seed script.",
    );
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existingUser) {
    throw createHttpError(409, "Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role || "client",
  });

  const token = signAccessToken({
    sub: user.id,
    role: user.role,
  });

  return {
    token,
    user,
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );

  if (!user) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password.");
  }

  if (user.status !== "active") {
    throw createHttpError(403, "User account is not active.");
  }

  const token = signAccessToken({
    sub: user.id,
    role: user.role,
  });

  user.password = undefined;

  return {
    token,
    user,
  };
};
