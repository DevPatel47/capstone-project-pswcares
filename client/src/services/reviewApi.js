import api from "./api";

export const getPSWReviewsRequest = async (profileId) => {
  const response = await api.get(`/reviews/psw-profile/${profileId}`);
  return response.data;
};

export const submitReviewRequest = async ({
  appointmentId,
  rating,
  comment,
}) => {
  const response = await api.post("/reviews", {
    appointmentId,
    rating,
    comment,
  });

  return response.data;
};
