import { Router } from "express";
import * as tc from "../controller/token.controller";
import { validate } from "../middleware/validation.middleware";
import { generateTokenSchema, tokenIdParamSchema } from "../validation/token.validation";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

// Customer endpoints
router.post("/", authorize(["CUSTOMER"]), validate(generateTokenSchema), tc.generateToken);
router.get("/current", authorize(["CUSTOMER"]), tc.getCurrentCustomerToken);
router.get("/history", authorize(["CUSTOMER"]), tc.getCustomerHistory);
router.post("/:id/cancel", authorize(["CUSTOMER"]), validate(tokenIdParamSchema), tc.cancelToken);

// Admin endpoints
router.get("/counter/:id/queue", authorize(["ADMIN"]), tc.getQueue);
router.post("/counter/:id/next", authorize(["ADMIN"]), tc.callNextToken);
router.post("/:id/complete", authorize(["ADMIN"]), validate(tokenIdParamSchema), tc.completeToken);
router.post("/:id/skip", authorize(["ADMIN"]), validate(tokenIdParamSchema), tc.skipToken);
// Admin can also cancel
router.post("/:id/cancel-admin", authorize(["ADMIN"]), validate(tokenIdParamSchema), tc.cancelToken);

export default router;
