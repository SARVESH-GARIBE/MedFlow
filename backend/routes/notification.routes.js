import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// GET /api/v1/notifications
router.get("/", getNotifications);

// PATCH /api/v1/notifications/read/:id
router.patch("/read/:id", markAsRead);

export default router;
