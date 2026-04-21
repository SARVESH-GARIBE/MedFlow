import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPatientPayments,
  getDoctorPayments
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/v1/payments/create-order
router.post("/create-order", protect, createPaymentOrder);

// POST /api/v1/payments/verify
router.post("/verify", protect, verifyPayment);

// GET /api/v1/payments/patient/:patientId
router.get("/patient/:patientId", protect, authorize('patient', 'admin'), getPatientPayments);

// GET /api/v1/payments/doctor
router.get("/doctor", protect, authorize('doctor', 'admin'), getDoctorPayments);

export default router;

