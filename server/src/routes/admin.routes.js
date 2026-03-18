import { Router } from "express";
import {
  getPendingPSWsForAdmin,
  updatePSWVerificationByAdmin,
} from "../controllers/pswProfile.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/psw-verifications/pending", getPendingPSWsForAdmin);
router.patch("/psw-verifications/:profileId", updatePSWVerificationByAdmin);

export default router;
