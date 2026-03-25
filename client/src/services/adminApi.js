import api from "./api";

export const getAdminAnalytics = async () => {
  const { data } = await api.get("/admin/analytics");
  return data;
};

export const getAdminUsers = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data;
};

export const getAdminVerificationQueue = async () => {
  const { data } = await api.get("/admin/verify");
  return data;
};

export const updateAdminVerification = async (profileId, payload) => {
  const { data } = await api.patch(`/admin/verify/${profileId}`, payload);
  return data;
};

export const getAdminDisputes = async (params = {}) => {
  const { data } = await api.get("/admin/disputes", { params });
  return data;
};

export const getAdminDisputeDetails = async (disputeId) => {
  const { data } = await api.get(`/admin/disputes/${disputeId}`);
  return data;
};

export const updateAdminDispute = async (disputeId, payload) => {
  const { data } = await api.patch(`/admin/disputes/${disputeId}`, payload);
  return data;
};

export const getAdminContacts = async (params = {}) => {
  const { data } = await api.get("/admin/contacts", { params });
  return data;
};

export const updateAdminContactStatus = async (contactId, status) => {
  const { data } = await api.patch(`/admin/contacts/${contactId}`, { status });
  return data;
};
