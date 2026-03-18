import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { uploadSingleFile } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/:type", uploadSingleFile, uploadFile);

export default router;
