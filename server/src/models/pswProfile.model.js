import mongoose from "mongoose";

export const PSW_VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

const pswProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    services: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      min: 0,
      required: true,
    },
    experience: {
      type: Number,
      min: 0,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    verificationStatus: {
      type: String,
      enum: PSW_VERIFICATION_STATUSES,
      default: "pending",
      required: true,
      index: true,
    },
    verificationNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const PSWProfile = mongoose.model("PSWProfile", pswProfileSchema);

export default PSWProfile;
