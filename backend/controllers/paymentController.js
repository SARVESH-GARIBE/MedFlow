import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Payment from "../models/Payment.js";

/**
 * Create a mock payment order
 * POST /api/v1/payments/create-order
 * Body: { appointmentId }
 */
export async function createPaymentOrder(req, res) {
  try {
    const { appointmentId } = req.body || {};

    // Validate input
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify user authorization
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this appointment",
      });
    }

    // Get doctor fee
    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found for this appointment",
      });
    }

    // Validate amount
    const amountInRupees = doctor.fee || 500; // Default: ₹500
    if (!amountInRupees || amountInRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor fee for payment",
      });
    }

    // Create mock order
    const orderId = "order_mock_" + Date.now();
    const amountInPaisa = Math.round(amountInRupees * 100);

    // Save order to database
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        appointment: appointment._id,
        patient: appointment.patient,
        orderId,
        amount: amountInRupees,
        currency: "INR",
        status: "created",
        method: "mock",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      order_id: orderId,
      orderId: orderId,
      amount: amountInPaisa,
      amountInRupees: amountInRupees,
      currency: "INR",
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
}

/**
 * Verify mock payment
 * POST /api/v1/payments/verify
 * Body: { orderId, appointmentId }
 */
export async function verifyPayment(req, res) {
  try {
    const { orderId, appointmentId } = req.body || {};

    // Validate input
    if (!orderId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "orderId and appointmentId are required",
      });
    }

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify user authorization
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify payment for this appointment",
      });
    }

    // Validate order ID format (mock validation)
    if (!orderId.startsWith("order_mock_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        appointment: appointment._id,
        patient: appointment.patient,
        orderId,
        status: "paid",
        method: "mock",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update appointment status
    appointment.paymentStatus = "paid";
    if (appointment.status === "pending") {
      appointment.status = "confirmed";
    }
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId,
      paymentStatus: "paid",
      appointmentStatus: appointment.status,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
}

/**
 * Get all payments for a patient
 * GET /api/v1/payments/patient/:patientId
 */
export async function getPatientPayments(req, res) {
  try {
    const { patientId } = req.params;

    // Authorization check
    if (req.user && req.user.id !== patientId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these payments",
      });
    }

    const payments = await Payment.find({ patient: patientId })
      .populate({
        path: "appointment",
        select: "appointmentDate timeSlot status paymentStatus",
        populate: {
          path: "doctor",
          select: "name specialization fee",
        },
      })
      .sort({ createdAt: -1 });

    const totalPaid = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      count: payments.length,
      totalPaid,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching patient payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient payments",
      error: error.message,
    });
  }
}

/**
 * Get all payments received by a doctor
 * GET /api/v1/payments/doctor
 */
export async function getDoctorPayments(req, res) {
  try {
    const doctorId = req.user.id;

    const payments = await Payment.find({})
      .populate({
        path: "appointment",
        match: { doctor: doctorId },
        select: "appointmentDate timeSlot status",
      })
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 });

    const doctorPayments = payments.filter(p => p.appointment != null);

    const totalEarnings = doctorPayments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayEarnings = doctorPayments
      .filter(p => p.status === "paid" && new Date(p.createdAt) >= todayStart && new Date(p.createdAt) <= todayEnd)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      count: doctorPayments.length,
      totalEarnings,
      todayEarnings,
      data: doctorPayments,
    });
  } catch (error) {
    console.error("Error fetching doctor payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor payments",
      error: error.message,
    });
  }
}

