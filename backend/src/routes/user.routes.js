import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);
router.get("/", listUsers);

export default router;
