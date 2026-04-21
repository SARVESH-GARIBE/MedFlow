import express from "express";
import {
    createPrescription,
    getPrescription,
    getDoctorPrescriptions,
    getPatientPrescriptions,
    updatePrescription,
    deletePrescription,
} from "../controllers/prescriptionController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create prescription - Doctor only
router.post(
    "/",
    protect,
    authorize("doctor", "admin"),
    createPrescription
);

// Get prescription by appointment ID
router.get(
    "/appointment/:appointmentId",
    protect,
    getPrescription
);

// Get doctor's prescriptions
router.get(
    "/doctor/list",
    protect,
    authorize("doctor", "admin"),
    getDoctorPrescriptions
);

// Get patient's prescriptions
router.get(
    "/patient/list",
    protect,
    authorize("patient", "admin"),
    getPatientPrescriptions
);

// Update prescription - Doctor only
router.patch(
    "/:prescriptionId",
    protect,
    authorize("doctor", "admin"),
    updatePrescription
);

// Delete prescription - Doctor only
router.delete(
    "/:prescriptionId",
    protect,
    authorize("doctor", "admin"),
    deletePrescription
);

export default router;
