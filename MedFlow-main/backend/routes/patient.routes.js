import express from "express";
import { registerPatient, loginPatient } from "../controllers/patientController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validatePatientRegistration } from "../validators/patientValidators.js";

const router = express.Router();

// POST /api/v1/patients/register
router.post("/register", validateRequest(validatePatientRegistration), registerPatient);

// POST /api/v1/patients/login
router.post("/login", loginPatient);

export default router;

