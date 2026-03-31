import api from "./api";

export const createBookingRequest = async (payload) => {
  const response = await api.post("/appointments", payload);
  return response.data;
};

export const getMyAppointmentsRequest = async () => {
  const response = await api.get("/appointments/me");
  return response.data;
};

export const updateBookingStatusRequest = async (appointmentId, status) => {
  const response = await api.patch(`/appointments/${appointmentId}/status`, {
    status,
  });
  return response.data;
};

export const rescheduleBookingRequest = async (appointmentId, payload) => {
  const response = await api.patch(
    `/appointments/${appointmentId}/reschedule`,
    payload,
  );
  return response.data;
};
