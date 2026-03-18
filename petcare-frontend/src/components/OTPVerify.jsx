// OtpVerify.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OtpVerify() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(""); // or get from previous step
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      const { role, name, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      alert(`Welcome, ${name}!`);

      if (role === "OWNER") navigate("/owner/dashboard");
      else if (role === "VETERINARIAN") navigate("/vet/dashboard");
    } catch (err) {
      console.error(err);
      alert("OTP verification failed");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}
