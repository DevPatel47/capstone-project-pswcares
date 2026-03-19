import api from "./api";

export const createBookingRequest = async (payload) => {
  const response = await api.post("/appointments", payload);
  return response.data;
};

export const getMyAppointmentsRequest = async () => {
  const response = await api.get("/appointments/me");
  return response.data;
};
