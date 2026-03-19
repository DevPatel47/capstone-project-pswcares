import Appointment from "../models/appointment.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import Review from "../models/review.model.js";
import { createHttpError } from "../utils/httpError.js";

const updatePSWRatingStats = async (pswProfileId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        pswProfileId,
      },
    },
    {
      $group: {
        _id: "$pswProfileId",
        reviewCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const reviewCount = stats?.reviewCount || 0;
  const averageRating =
    reviewCount > 0 ? Number(Number(stats.averageRating).toFixed(2)) : 0;

  await PSWProfile.findByIdAndUpdate(pswProfileId, {
    reviewCount,
    averageRating,
  });
};

export const createReviewForAppointment = async ({
  actor,
  appointmentId,
  rating,
  comment,
}) => {
  if (actor.role !== "client") {
    throw createHttpError(403, "Only clients can submit reviews.");
  }

  if (!appointmentId) {
    throw createHttpError(400, "appointmentId is required.");
  }

  const numericRating = Number(rating);

  if (
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw createHttpError(400, "rating must be between 1 and 5.");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  if (String(appointment.clientId) !== String(actor._id)) {
    throw createHttpError(403, "You can only review your own appointment.");
  }

  if (appointment.status !== "completed") {
    throw createHttpError(
      400,
      "Review is allowed only after appointment completion.",
    );
  }

  const existingReview = await Review.findOne({
    appointmentId: appointment._id,
  });

  if (existingReview) {
    throw createHttpError(409, "Review already exists for this appointment.");
  }

  const pswProfile = await PSWProfile.findOne({ userId: appointment.pswId });

  if (!pswProfile) {
    throw createHttpError(404, "PSW profile not found.");
  }

  const review = await Review.create({
    appointmentId: appointment._id,
    clientId: actor._id,
    pswId: appointment.pswId,
    pswProfileId: pswProfile._id,
    rating: numericRating,
    comment: String(comment || "").trim(),
  });

  await updatePSWRatingStats(pswProfile._id);

  return review;
};

export const getReviewsForPSWProfile = async ({ profileId, actor }) => {
  const profile = await PSWProfile.findOne({
    _id: profileId,
    verificationStatus: "approved",
  }).populate("userId", "name");

  if (!profile) {
    throw createHttpError(404, "Profile not found.");
  }

  const reviews = await Review.find({ pswProfileId: profile._id })
    .populate("clientId", "name")
    .sort({ createdAt: -1 });

  let eligibleAppointments = [];

  if (actor && actor.role === "client") {
    const completedAppointments = await Appointment.find({
      clientId: actor._id,
      pswId: profile.userId?._id || profile.userId,
      status: "completed",
    })
      .select("_id appointmentDate appointmentTime")
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    const reviewedIds = new Set(
      (
        await Review.find({
          appointmentId: { $in: completedAppointments.map((item) => item._id) },
        }).select("appointmentId")
      ).map((item) => String(item.appointmentId)),
    );

    eligibleAppointments = completedAppointments
      .filter((item) => !reviewedIds.has(String(item._id)))
      .map((item) => ({
        _id: item._id,
        appointmentDate: item.appointmentDate,
        appointmentTime: item.appointmentTime,
      }));
  }

  return {
    profile,
    reviews,
    eligibleAppointments,
  };
};
