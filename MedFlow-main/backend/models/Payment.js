import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    method: {
      type: String,
      default: "mock",
    },
  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;

