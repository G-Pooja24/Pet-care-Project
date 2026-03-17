import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("OWNER");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email || !name) return alert("Enter name & email");
    try {
      // url suffix only, baseURL handles the rest
      await api.post("/auth/send-otp", { name, email, role });
      setOtpSent(true);
      alert("OTP sent to your email!");
    } catch (err) {
      console.error(err.response || err.message);
      // api.auth/send-otp is 404 only if the endpoint doesn't exist
      // If user isn't found, backend might return 404, triggering registration flow
      if (err.response?.status === 404) {
        navigate("/register", { state: { email, name, role } });
      } else {
        alert(err.response?.data?.message || "Failed to send OTP");
      }
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await api.post(
        `/auth/verify-otp?email=${email}&otp=${otp}`
      );

      if (res.data.token) {
        console.log("Login Success:", res.data);
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("role", res.data.role);
        sessionStorage.setItem("name", res.data.name);
        if (res.data.id) sessionStorage.setItem("ownerId", res.data.id);
        else if (res.data.userId) sessionStorage.setItem("ownerId", res.data.userId);
        else if (res.data.user && res.data.user.id) sessionStorage.setItem("ownerId", res.data.user.id);

        if (onLogin) onLogin(res.data.token, res.data.role);

        // Redirect based on role
        if (res.data.role === "OWNER") navigate("/owner/dashboard");
        else if (res.data.role === "ADMIN") navigate("/admin/products");
        else navigate("/vet/dashboard");

      } else {
        alert(res?.data?.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("OTP error:", err.response || err.message);
      alert("Invalid OTP");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{otpSent ? "Verify OTP" : "Welcome Back"}</h2>
        <p className="text-muted">
          {otpSent ? `We've sent a code to ${email}` : "Login to manage your pet's healthcare"}
        </p>

        {!otpSent ? (
          <div className="form-content">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <select className="form-control" value={role} onChange={e => setRole(e.target.value.toUpperCase())}>
                <option value="OWNER">Pet Owner</option>
                <option value="VETERINARIAN">Veterinarian</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button className="btn-primary" onClick={sendOtp}>
              Send Security Code
            </button>
            <p className="text-sm" style={{ marginTop: "1.5rem" }}>
              New to PetCare? <button onClick={() => navigate("/register")}>Create Account</button>
            </p>
          </div>
        ) : (
          <div className="form-content">
            <div className="form-group">
              <label className="form-label">Enter 6-digit Code</label>
              <input
                className="form-control"
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "5px", fontWeight: "700" }}
              />
            </div>
            <button className="btn-primary" onClick={verifyOtp}>
              Verify & Login
            </button>
            <button
              onClick={() => setOtpSent(false)}
              className="text-sm"
              style={{ background: "none", border: "none", color: "#6c757d", cursor: "pointer", marginTop: "1.5rem", display: "block", width: "100%" }}
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
