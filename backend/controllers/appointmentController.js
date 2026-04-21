import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Notification from "../models/Notification.js";

// Create a new appointment
export async function createAppointment(req, res) {
  try {
    const body = req.body || {};
    const { doctor, appointmentDate, timeSlot, symptoms, patient, urgency } = body;

    if (!doctor || !appointmentDate || !timeSlot || !patient) {
      return res.status(400).json({
        success: false,
        message: "Patient, doctor, appointmentDate and timeSlot are required",
      });
    }

    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Triage Scoring Engine
    let score = 0;
    const safeUrgency = urgency && ["Routine", "Urgent", "Emergency"].includes(urgency) ? urgency : "Routine";

    // Explicit evaluation
    if (safeUrgency === "Emergency") score += 100;
    else if (safeUrgency === "Urgent") score += 50;

    // Symptom linguistic evaluation
    if (symptoms) {
      const lowerSym = symptoms.toLowerCase();
      const highPriorityWords = ["pain", "bleeding", "severe", "chest", "emergency", "breath", "faint", "vomit", "fever", "accident", "trauma", "unconscious"];
      highPriorityWords.forEach(word => {
        if (lowerSym.includes(word)) score += 20;
      });
    }

    let pLevel = "Routine";
    if (score >= 100) pLevel = "High";
    else if (score >= 40) pLevel = "Medium";

    const appointment = new Appointment({
      patient,
      doctor,
      department: doctorExists.specialization || "",
      appointmentDate,
      timeSlot,
      symptoms,
      urgency: safeUrgency,
      priorityScore: score,
      priorityLevel: pLevel,
      status: "pending",
      paymentStatus: "pending",
    });

    const savedAppointment = await appointment.save();

    // Trigger Notification for Doctor
    await Notification.create({
      userId: doctorExists._id,
      role: "doctor",
      message: `New appointment booked for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot}. Priority: ${pLevel}`,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get all appointments for a specific patient
export async function getPatientAppointments(req, res) {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name specialization")
      .sort({ appointmentDate: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get all appointments for a logged-in doctor securely
export async function getDoctorAppointments(req, res) {
  try {
    const doctorId = req.user.id;

    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email")
      .sort({ appointmentDate: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Update appointment status
export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing status",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Prevent unnecessary updates
    if (appointment.status === status) {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${status}`,
      });
    }

    appointment.status = status;

    // Set completedAt when marking as completed
    if (status === "completed") {
      appointment.completedAt = new Date();
    }

    const updatedAppointment = await appointment.save();

    // Trigger Notification for Patient on Status Update
    await Notification.create({
      userId: updatedAppointment.patient,
      role: "patient",
      message: `Your appointment status has been updated to: ${status}`,
    });

    return res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get all booked slots for a specific doctor on a specific date securely
export async function getBookedSlots(req, res) {
  try {
    const { doctorId, date } = req.params;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and date are required",
      });
    }

    // Parse start and end of the requested date for filtering
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    }).select("timeSlot");

    const bookedSlots = appointments.map((appt) => appt.timeSlot);

    return res.status(200).json({
      success: true,
      data: bookedSlots,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching availability",
    });
  }
}

