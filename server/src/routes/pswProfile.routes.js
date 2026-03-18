import { Router } from "express";
import {
  getMyPSWProfile,
  uploadMyCertificate,
  upsertMyPSWProfile,
} from "../controllers/pswProfile.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { uploadSingleFile } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("psw"));

router.put("/me", upsertMyPSWProfile);
router.get("/me", getMyPSWProfile);
router.post("/me/certificates", uploadSingleFile, uploadMyCertificate);

export default router;
