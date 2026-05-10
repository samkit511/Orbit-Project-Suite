import { Router } from "express";
import { create, detail, list, remove, update, updateStatus } from "../controllers/task.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router.post("/", create);
router.get("/", list);
router.get("/:id", detail);
router.put("/:id", update);
router.delete("/:id", remove);
router.patch("/:id/status", updateStatus);

export default router;

