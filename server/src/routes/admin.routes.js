import { Router } from "express";
import {
  getAnalytics,
  getDisputeDetails,
  getDisputes,
  getUsers,
  getVerificationQueue,
  updateDispute,
  updateVerification,
} from "../controllers/admin.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/users", getUsers);
router.get("/verify", getVerificationQueue);
router.patch("/verify/:profileId", updateVerification);

router.get("/disputes", getDisputes);
router.get("/disputes/:disputeId", getDisputeDetails);
router.patch("/disputes/:disputeId", updateDispute);

router.get("/analytics", getAnalytics);

export default router;
