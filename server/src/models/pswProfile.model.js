import mongoose from "mongoose";

export const PSW_VERIFICATION_STATUSES = ["pending", "approved", "rejected"];
export const AVAILABILITY_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const availabilitySlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: AVAILABILITY_DAYS,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"],
    },
  },
  {
    _id: false,
  },
);

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
    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
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
