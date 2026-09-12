import { Router } from "express";
import * as dc from "../controller/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Public
router.get("/stats", dc.getDashboardStats);

// Admin Only
router.use(authenticate);
router.use(authorize(["ADMIN"]));

export default router;
