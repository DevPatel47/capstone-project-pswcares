import { Router } from "express";
import {
  getAnalytics,
  getContacts,
  getDisputeDetails,
  getDisputes,
  getUsers,
  getVerificationQueue,
  updateContactStatus,
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

router.get("/contacts", getContacts);
router.patch("/contacts/:contactId", updateContactStatus);

export default router;
