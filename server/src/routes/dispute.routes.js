import { Router } from "express";
import {
  createMyDispute,
  getDisputeDetails,
  getMyDisputes,
} from "../controllers/dispute.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("client"), createMyDispute);
router.get("/me", authorizeRoles("client"), getMyDisputes);
router.get("/:disputeId", authorizeRoles("client", "admin"), getDisputeDetails);

export default router;
