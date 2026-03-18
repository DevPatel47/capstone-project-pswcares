import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import pswProfileRoutes from "./pswProfile.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/health", healthRoutes);
router.use("/psw-profiles", pswProfileRoutes);
router.use("/uploads", uploadRoutes);

export default router;
