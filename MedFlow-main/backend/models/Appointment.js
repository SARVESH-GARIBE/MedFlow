import mongoose from "mongoose";

const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    department: {
      type: String,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    symptoms: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    urgency: {
      type: String,
      enum: ["Routine", "Urgent", "Emergency"],
      default: "Routine",
    },
    priorityLevel: {
      type: String,
      enum: ["High", "Medium", "Routine"],
      default: "Routine",
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    hasPrescription: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ patient: 1, status: 1 });

const Appointment =
  mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;

