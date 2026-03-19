import {
  createReviewForAppointment,
  getReviewsForPSWProfile,
} from "../services/review.service.js";

export const submitReview = async (req, res, next) => {
  try {
    const review = await createReviewForAppointment({
      actor: req.user,
      appointmentId: req.body.appointmentId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json({
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const getPSWReviews = async (req, res, next) => {
  try {
    const result = await getReviewsForPSWProfile({
      profileId: req.params.profileId,
      actor: req.user,
    });

    res.status(200).json({
      profile: result.profile,
      reviews: result.reviews,
      eligibleAppointments: result.eligibleAppointments,
    });
  } catch (error) {
    next(error);
  }
};
