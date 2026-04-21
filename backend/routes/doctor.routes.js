import express from "express";
import {
  createDoctorProfile,
  getDoctors,
  getNearbyDoctors,
  updateDoctorAvailability,
  updateDoctorSchedule,
  getDoctorProfile,
  registerDoctor,
  getDoctorById
} from "../controllers/doctorController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateDoctorCreation } from "../validators/doctorValidators.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/v1/doctors/register
router.post("/doctors/register", registerDoctor);

// POST /api/v1/doctors
router.post("/doctors", validateRequest(validateDoctorCreation), createDoctorProfile);

// GET /api/v1/doctors/me
router.get("/doctors/me", protect, authorize('doctor', 'admin'), getDoctorProfile);

// GET /api/v1/doctors/nearby - MUST be before /:id routes to avoid conflicts
router.get("/doctors/nearby", getNearbyDoctors);

// GET /api/v1/doctors
router.get("/doctors", getDoctors);

// GET /api/v1/doctors/:id
router.get("/doctors/:id", getDoctorById);

// PATCH /api/v1/doctors/:id/availability
router.patch("/doctors/:id/availability", updateDoctorAvailability);

// PATCH /api/v1/doctors/:id/schedule
router.patch("/doctors/:id/schedule", updateDoctorSchedule);

export default router;
