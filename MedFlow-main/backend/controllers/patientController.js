import Patient from "../models/Patient.js";
import bcrypt from "bcrypt";

// Register a new patient
export async function registerPatient(req, res) {
  try {
    const body = req.body || {};
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const emailLC = (email || "").toLowerCase();

    const existing = await Patient.findOne({ email: emailLC });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Patient with this email already exists",
      });
    }

    const patient = new Patient({
      ...body,
      email: emailLC,
    });

    const savedPatient = await patient.save();

    const plain =
      savedPatient.toObject ? savedPatient.toObject() : { ...savedPatient };
    delete plain.password;

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: plain,
    });
  } catch (error) {
    console.error("Error registering patient:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Login patient
export async function loginPatient(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const emailLC = (email || "").toLowerCase();

    const patient = await Patient.findOne({ email: emailLC }).select("+password");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const plain = patient.toObject ? patient.toObject() : { ...patient };
    delete plain.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: plain,
    });
  } catch (error) {
    console.error("Error logging in patient:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

