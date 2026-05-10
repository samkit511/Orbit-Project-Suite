import { Router } from "express";
import { recent, stats } from "../controllers/dashboard.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router.get("/stats", stats);
router.get("/recent", recent);

export default router;
