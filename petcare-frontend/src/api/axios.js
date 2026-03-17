import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api", // Unified backend base URL
});

// Automatically attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  // Don't attach token for auth endpoints (login/register/otp)
  // This prevents 403 errors if a stale/invalid token is present
  if (token && !config.url.includes("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.log(`[API Request] ${config.method.toUpperCase()} ${config.url} - Token Present`);
  } else {
    // console.warn(`[API Request] ${config.method.toUpperCase()} ${config.url} - No Token Found`);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error("403 Forbidden Error Detail:", {
        url: error.config.url,
        method: error.config.method,
        // data: error.response.data, // Check if data is preventing clean log
        hasAuthHeader: !!error.config.headers.Authorization,
        role: sessionStorage.getItem("role"),
        tokenPrefix: sessionStorage.getItem("token")?.substring(0, 10) + "..."
      });
    }
    return Promise.reject(error);
  }
);

export default api;
