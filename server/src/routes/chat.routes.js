import { Router } from "express";
import { getMessagesByAppointment } from "../controllers/chat.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("client", "psw", "admin"));

router.get("/:appointmentId/messages", getMessagesByAppointment);

export default router;
