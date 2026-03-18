import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import pswRoutes from "./psw.routes.js";
import pswProfileRoutes from "./pswProfile.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/health", healthRoutes);
router.use("/psw", pswRoutes);
router.use("/psw-profiles", pswProfileRoutes);
router.use("/uploads", uploadRoutes);

export default router;
