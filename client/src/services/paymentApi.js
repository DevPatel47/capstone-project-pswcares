import api from "./api";

export const createCheckoutSessionRequest = async ({ appointmentId }) => {
  const response = await api.post("/payments/checkout-session", {
    appointmentId,
  });
  return response.data;
};

export const processPaymentSuccessRequest = async (sessionId) => {
  const response = await api.get("/payments/success", {
    params: {
      session_id: sessionId,
    },
  });

  return response.data;
};

export const processPaymentCancelRequest = async (sessionId) => {
  const response = await api.get("/payments/cancel", {
    params: {
      session_id: sessionId,
    },
  });

  return response.data;
};
