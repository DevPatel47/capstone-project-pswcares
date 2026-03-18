import { Router } from "express";
import {
  createBooking,
  getMyAppointments,
  rescheduleBooking,
  updateBookingStatus,
} from "../controllers/appointment.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("client"), createBooking);
router.get("/me", authorizeRoles("client", "psw", "admin"), getMyAppointments);
router.patch(
  "/:appointmentId/status",
  authorizeRoles("client", "psw", "admin"),
  updateBookingStatus,
);
router.patch(
  "/:appointmentId/reschedule",
  authorizeRoles("client", "psw", "admin"),
  rescheduleBooking,
);

export default router;
