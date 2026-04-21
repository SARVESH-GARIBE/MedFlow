import express from "express";
import {
  createReview,
  getDoctorReviews,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/v1/reviews
// Only authenticated patients can leave a review
router.post("/", protect, authorize("patient", "admin"), createReview);

// GET /api/v1/reviews/doctor/:doctorId
// Public route - anyone viewing the doctor profile/booking can see reviews
router.get("/doctor/:doctorId", getDoctorReviews);

export default router;
