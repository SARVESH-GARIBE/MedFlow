import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: ["super_admin", "admin", "doctor", "patient"],
      default: "patient",
      index: true,
    },
    assignedArea: {
      city: {
        type: String,
        default: "",
        index: true,
      },
      area: {
        type: String,
        default: "",
      },
    },
    verification: {
      documentType: {
        type: String,
        enum: ["aadhaar", "pan", "medical_license", "driving_license"],
        default: null,
      },
      documentIdMasked: {
        type: String,
        default: "",
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    // Doctor-specific fields
    specialization: { type: String, default: null },
    experience: { type: String, default: "" },
    qualifications: { type: String, default: "" },
    location: { type: String, default: "" },
    about: { type: String, default: "" },
    locationDetails: {
      city: { type: String, default: "", index: true },
      area: { type: String, default: "" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    clinicType: {
      type: String,
      enum: ["government", "private"],
      default: "private",
      index: true
    },
    fee: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    schedule: { type: Map, of: [String], default: {} },
    success: { type: String, default: "" },
    patients: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // Patient-specific fields
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dateOfBirth: {
      type: Date,
    },

    // Common fields
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ "assignedArea.city": 1, "assignedArea.area": 1 });
userSchema.index({ "verification.isVerified": 1 });
userSchema.index({ name: 'text', specialization: 'text' });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;