import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/users", protectRoute, getUsersForSidebar)
router.post('/send/:id', protectRoute, sendMessage);
router.post('/:id', protectRoute, getMessages)


export default router