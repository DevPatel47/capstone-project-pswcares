import { Router } from "express";
import {
  createCheckoutSession,
  paymentCancel,
  paymentSuccess,
} from "../controllers/payment.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/checkout-session",
  authenticate,
  authorizeRoles("client"),
  createCheckoutSession,
);

// These are redirect handlers from Stripe test checkout.
router.get("/success", paymentSuccess);
router.get("/cancel", paymentCancel);

export default router;
