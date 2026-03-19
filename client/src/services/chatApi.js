import api from "./api";

export const getMessagesByAppointmentRequest = async (appointmentId) => {
  const response = await api.get(`/chats/${appointmentId}/messages`);
  return response.data;
};
