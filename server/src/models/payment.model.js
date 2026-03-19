import mongoose from "mongoose";

export const PAYMENT_STATUSES = ["pending", "succeeded", "cancelled", "failed"];

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pswId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "cad",
      lowercase: true,
      trim: true,
      maxlength: 10,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: "pending",
      index: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
