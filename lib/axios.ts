import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
});

// --- Request Interceptor (add token) ---
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- Response Interceptor (handle unauthorized) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    localStorage.removeItem("user");
      window.location.href = "/login"; // redirect user
    }
    return Promise.reject(error);
  }
);

export default api;
