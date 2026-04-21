import Review from "../models/Review.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// @desc    Create a new review for a doctor
// @route   POST /api/v1/reviews
export const createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    if (!doctorId || !appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Doctor, appointment and rating are required",
      });
    }

    // Verify rating bounds
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Authorization: ensure the currently logged in patient actually owns this appointment
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to review this appointment",
      });
    }

    // Check if the user already reviewed this same appointment
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this appointment",
      });
    }

    // Create the review
    const review = await Review.create({
      patient: req.user.id,
      doctor: doctorId,
      appointment: appointmentId,
      rating: Number(rating),
      comment: comment || "",
    });

    // Recalculate doctor ratings dynamically matching the database state
    const allReviews = await Review.find({ doctor: doctorId });
    const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
    const avgRating = totalRating / allReviews.length;

    // Persist average back to doctor document
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review successfully published",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while publishing review",
    });
  }
};

// @desc    Get reviews for a specific doctor
// @route   GET /api/v1/reviews/doctor/:doctorId
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.find({ doctor: doctorId })
      .populate("patient", "name imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching doctor reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
