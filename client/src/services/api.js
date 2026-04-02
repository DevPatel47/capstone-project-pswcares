import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const requestUrl = String(error.config?.url || "");

    if (statusCode === 401) {
      clearAuthSession();

      const isAuthRoute =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register");
      const isLoginPage = window.location.pathname === "/login";

      if (!isAuthRoute && !isLoginPage) {
        window.location.replace("/login");
      }
    }

    if (!error.response && error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    } else if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  },
);

export default api;
