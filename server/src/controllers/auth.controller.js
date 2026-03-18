import { loginUser, registerUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      message: "Login successful.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};
