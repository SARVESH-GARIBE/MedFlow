import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      default: "Twice daily",
    },
    duration: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      default: "Oral",
    },
    instructions: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },
    doctorSnapshot: {
      name: { type: String, required: true },
      specialization: { type: String, default: "General Practice" },
    },
    medicines: {
      type: [medicineSchema],
      validate: [
        (val) => val.length > 0 && val.length <= 20,
        "Medicines must be between 1 and 20 entries",
      ],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    isFinal: {
      type: Boolean,
      default: true,
    },
    prescriptionHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Helper method to generate hash
prescriptionSchema.statics.generateHash = function (payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
};

// Index for optimal queries
prescriptionSchema.index({ appointmentId: 1, version: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ patient: 1, createdAt: -1 });

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
