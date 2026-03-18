import { Router } from "express";
import { searchPSWs } from "../controllers/pswProfile.controller.js";

const router = Router();

router.get("/search", searchPSWs);

export default router;
