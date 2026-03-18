import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pswProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PSWProfile",
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    s3Key: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
