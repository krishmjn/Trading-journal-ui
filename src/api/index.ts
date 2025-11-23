import axios from "axios";
import { API_BASE_URL } from "@/common/constants/endpoints";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ADD THIS - crucial for CORS
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
