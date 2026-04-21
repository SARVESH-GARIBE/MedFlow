import crypto from "crypto";
import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";

const generateHash = (payload) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
};

// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, notes } = req.body;
    const doctorId = req.user.id;

    // Validate medicines
    if (!medicines || medicines.length === 0 || medicines.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Medicines array must contain between 1 and 20 entries",
      });
    }

    // Fetch and validate appointment
    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor",
      "name specialization"
    );
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify doctor is the treating physician
    if (appointment.doctor._id.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to prescribe for this appointment",
      });
    }

    // Verify appointment is completed and payment is confirmed
    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only create prescriptions for completed appointments",
      });
    }

    // Check if prescription already exists
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: "Prescription already exists for this appointment",
      });
    }

    // Create doctor snapshot
    const doctorSnapshot = {
      name: appointment.doctor.name,
      specialization: appointment.doctor.specialization || "General Practice",
    };

    // Generate cryptographic hash
    const hashPayload = {
      appointmentId: appointmentId.toString(),
      medicines,
      notes: notes || "",
      doctorSnapshot,
    };
    const prescriptionHash = generateHash(hashPayload);

    // Create prescription
    const prescription = await Prescription.create({
      patient: appointment.patient,
      doctor: appointment.doctor._id,
      appointmentId,
      doctorSnapshot,
      medicines,
      notes: notes || "",
      prescriptionHash,
      isFinal: true,
      version: 1,
    });

    // Mark appointment as having prescription
    appointment.hasPrescription = true;
    await appointment.save();

    // Trigger Notification for Patient
    await Notification.create({
      userId: appointment.patient,
      role: "patient",
      message: `Dr. ${appointment.doctor.name} has prescribed medications for your recent visit.`,
    });

    // Log event
    console.log(
      JSON.stringify({
        event: "PRESCRIPTION_CREATED",
        prescriptionId: prescription._id.toString(),
        doctorId,
        patientId: appointment.patient.toString(),
        medicineCount: medicines.length,
        timestamp: new Date().toISOString(),
      })
    );

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    console.error("Prescription Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating prescription",
      error: error.message,
    });
  }
};

// Get prescription by appointment ID
export const getPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch appointment to verify access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check authorization
    const isDoctor = appointment.doctor.toString() === userId;
    const isPatient = appointment.patient.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this prescription",
      });
    }

    // Fetch the latest final prescription
    const prescription = await Prescription.findOne({
      appointmentId,
      isFinal: true,
    })
      .populate("doctor", "name specialization imageUrl email")
      .populate("patient", "name email");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not yet created for this appointment",
      });
    }

    return res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error("Prescription Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching prescription",
      error: error.message,
    });
  }
};

// Get all prescriptions for a doctor
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const prescriptions = await Prescription.find({
      doctor: doctorId,
      isFinal: true,
    })
      .populate("patient", "name email")
      .populate("appointmentId", "appointmentDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Doctor Prescriptions Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

// Get all prescriptions for a patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;

    const prescriptions = await Prescription.find({
      patient: patientId,
      isFinal: true,
    })
      .populate("doctor", "name specialization imageUrl email")
      .populate("appointmentId", "appointmentDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Patient Prescriptions Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

// Update prescription
export const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medicines, notes } = req.body;
    const doctorId = req.user.id;

    // Validate medicines if provided
    if (medicines && (medicines.length === 0 || medicines.length > 20)) {
      return res.status(400).json({
        success: false,
        message: "Medicines array must contain between 1 and 20 entries",
      });
    }

    // Fetch the prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Verify doctor ownership
    if (prescription.doctor.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own prescriptions",
      });
    }

    // Mark old version as not final
    prescription.isFinal = false;
    await prescription.save();

    // Create new version
    const newVersion = prescription.version + 1;
    const updatedData = {
      medicines: medicines || prescription.medicines,
      notes: notes !== undefined ? notes : prescription.notes,
      version: newVersion,
      previousVersionId: prescription._id,
      isFinal: true,
    };

    // Generate new hash
    const hashPayload = {
      appointmentId: prescription.appointmentId.toString(),
      medicines: updatedData.medicines,
      notes: updatedData.notes,
      version: newVersion,
      doctorSnapshot: prescription.doctorSnapshot,
    };
    updatedData.prescriptionHash = generateHash(hashPayload);

    const updatedPrescription = await Prescription.create({
      patient: prescription.patient,
      doctor: prescription.doctor,
      appointmentId: prescription.appointmentId,
      doctorSnapshot: prescription.doctorSnapshot,
      ...updatedData,
    });

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      data: updatedPrescription,
    });
  } catch (error) {
    console.error("Prescription Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating prescription",
      error: error.message,
    });
  }
};

// Delete prescription
export const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const doctorId = req.user.id;

    // Fetch the prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Verify doctor ownership
    if (prescription.doctor.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own prescriptions",
      });
    }

    // Delete the prescription
    await Prescription.findByIdAndDelete(prescriptionId);

    // Update appointment - remove prescription flag
    await Appointment.findByIdAndUpdate(prescription.appointmentId, {
      hasPrescription: false,
    });

    // Log event
    console.log(
      JSON.stringify({
        event: "PRESCRIPTION_DELETED",
        prescriptionId,
        doctorId,
        appointmentId: prescription.appointmentId.toString(),
        timestamp: new Date().toISOString(),
      })
    );

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Prescription Deletion Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting prescription",
      error: error.message,
    });
  }
};
