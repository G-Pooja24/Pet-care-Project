import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css"; // Reusing the modern styles from Login

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Clear any existing session to prevent interference
    sessionStorage.clear();
  }, []);

  // Pre-filled if coming from OTP verification
  const [name, setName] = useState(location.state?.name || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [role, setRole] = useState(location.state?.role || "OWNER");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    if (!name || !email || !password) {
      alert("All fields are required!");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create Account</h2>
        <p className="text-muted">Join the PetCare community today</p>

        <div className="form-content">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Create Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="OWNER">Pet Owner</option>
              <option value="VETERINARIAN">Veterinarian</option>
            </select>
          </div>

          <button className="btn-primary" onClick={registerUser}>
            Complete Registration
          </button>

          <p className="text-sm" style={{ marginTop: "1.5rem" }}>
            Already have an account? <button onClick={() => navigate("/login")}>Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}
