import api from "./api";

export const createDisputeRequest = async (payload) => {
  const { data } = await api.post("/disputes", payload);
  return data;
};

export const getMyDisputesRequest = async (params = {}) => {
  const { data } = await api.get("/disputes/me", { params });
  return data;
};

export const getDisputeDetailsRequest = async (disputeId) => {
  const { data } = await api.get(`/disputes/${disputeId}`);
  return data;
};
