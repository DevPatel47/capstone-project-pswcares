import { Router } from "express";
import {
  getPSWReviews,
  submitReview,
} from "../controllers/review.controller.js";
import {
  authenticate,
  authorizeRoles,
  optionalAuthenticate,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/psw-profile/:profileId", optionalAuthenticate, getPSWReviews);
router.post("/", authenticate, authorizeRoles("client"), submitReview);

export default router;
