import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chat.routes.js";
import contactRoutes from "./contact.routes.js";
import disputeRoutes from "./dispute.routes.js";
import healthRoutes from "./health.routes.js";
import paymentRoutes from "./payment.routes.js";
import pswRoutes from "./psw.routes.js";
import pswProfileRoutes from "./pswProfile.routes.js";
import reviewRoutes from "./review.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/chats", chatRoutes);
router.use("/contact", contactRoutes);
router.use("/disputes", disputeRoutes);
router.use("/health", healthRoutes);
router.use("/payments", paymentRoutes);
router.use("/psw", pswRoutes);
router.use("/psw-profiles", pswProfileRoutes);
router.use("/reviews", reviewRoutes);
router.use("/uploads", uploadRoutes);

export default router;
