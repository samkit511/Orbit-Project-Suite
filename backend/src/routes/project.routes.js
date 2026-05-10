import { Router } from "express";
import { addMember, create, detail, list, removeMember } from "../controllers/project.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateJWT);

router.post("/", requireRole("ADMIN", "MANAGER"), create);
router.get("/", list);
router.get("/:id", detail);
router.post("/:id/members", requireRole("ADMIN", "MANAGER"), addMember);
router.delete("/:id/members/:memberId", requireRole("ADMIN", "MANAGER"), removeMember);

export default router;

