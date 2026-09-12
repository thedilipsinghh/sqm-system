import { Router } from "express";
import * as cc from "../controller/counter.controller";
import { validate } from "../middleware/validation.middleware";
import { createCounterSchema, updateCounterSchema, counterIdParamSchema } from "../validation/counter.validation";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Public
router.get("/", cc.getCounters);

// Admin Only
router.use(authenticate);
router.use(authorize(["ADMIN"]));

router.post("/", validate(createCounterSchema), cc.createCounter);
router.put("/:id", validate(updateCounterSchema), cc.updateCounter);
router.delete("/:id", validate(counterIdParamSchema), cc.deleteCounter);

router.post("/:id/activate", validate(counterIdParamSchema), cc.activateCounter);
router.post("/:id/deactivate", validate(counterIdParamSchema), cc.deactivateCounter);
router.post("/:id/pause", validate(counterIdParamSchema), cc.pauseCounter);
router.post("/:id/resume", validate(counterIdParamSchema), cc.resumeCounter);

export default router;
