import api from "./api";

export const getMyPSWProfileRequest = async () => {
  const response = await api.get("/psw-profiles/me");
  return response.data;
};

export const upsertMyPSWProfileRequest = async (payload) => {
  const response = await api.put("/psw-profiles/me", payload);
  return response.data;
};

export const uploadMyCertificateRequest = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/psw-profiles/me/certificates", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getPublicPSWProfileRequest = async (profileId) => {
  const response = await api.get(`/psw-profiles/public/${profileId}`);
  return response.data;
};

export const searchPSWsRequest = async (params = {}) => {
  const response = await api.get("/psw/search", { params });
  return response.data;
};
