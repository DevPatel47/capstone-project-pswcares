import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("admin"),
  (_req, res) => {
    res.status(200).json({
      message: "Admin access granted.",
    });
  },
);

export default router;
