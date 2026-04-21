import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";

// @desc    Get public system statistics for landing page
// @route   GET /api/v1/public/stats
export const getPublicStats = async (req, res) => {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      Doctor.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true }),
      Appointment.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        doctors: doctors || 150, // Base default visual numbers if DB is empty
        patients: patients || 1200,
        appointments: appointments || 8000,
      },
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching stats",
    });
  }
};
