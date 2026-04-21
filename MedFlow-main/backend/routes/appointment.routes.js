import express from "express";
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getBookedSlots,
} from "../controllers/appointmentController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateAppointmentCreation } from "../validators/appointmentValidators.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/v1/appointments
router.post("/", protect, authorize('patient', 'admin'), validateRequest(validateAppointmentCreation), createAppointment);

// GET /api/v1/appointments/booked-slots/:doctorId/:date
router.get("/booked-slots/:doctorId/:date", protect, getBookedSlots);

// GET /api/v1/appointments/patient/:patientId
router.get("/patient/:patientId", protect, authorize('patient', 'admin'), getPatientAppointments);

// GET /api/v1/appointments/doctor
router.get("/doctor", protect, authorize('doctor', 'admin'), getDoctorAppointments);

// PATCH /api/v1/appointments/:id/status
router.patch("/:id/status", protect, authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;

