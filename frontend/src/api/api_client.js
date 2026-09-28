import axios from "axios";

// single axios instance used by every api file, points at the backend
const api_client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

// attaches the saved login token to every outgoing request, if there is one
api_client.interceptors.request.use((config) => {
  const token = localStorage.getItem("waste_tracker_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// logs the user out automatically if the token is rejected by the backend
api_client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("waste_tracker_token");
      localStorage.removeItem("waste_tracker_user");
    }
    return Promise.reject(error);
  }
);

export default api_client;
