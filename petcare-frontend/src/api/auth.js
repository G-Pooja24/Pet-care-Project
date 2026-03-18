import axios from "axios";

const API_URL = "http://localhost:9090/auth";

export const sendOtp = (email) => {
  return axios.post(`${API_URL}/send-otp`, { email });
};

export const verifyOtp = (email, otp) => {
  return axios.post(`${API_URL}/verify-otp`, { email, otp });
};

export const getOwnerProfile = (token) => {
  return axios.get("http://localhost:9090/api/owner/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVetProfile = (token) => {
  return axios.get("http://localhost:9090/api/vet/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateOwnerProfile = (token, data) => {
  return axios.put("http://localhost:9090/api/owner/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateVetProfile = (token, data) => {
  return axios.put("http://localhost:9090/api/vet/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
