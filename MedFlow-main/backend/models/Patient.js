import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dateOfBirth: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);


const Patient =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export default Patient;

