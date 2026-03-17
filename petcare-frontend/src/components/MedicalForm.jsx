import React, { useState } from "react";
import axios from "../api/axios";

export default function MedicalForm({ petId, refresh }) {
  const [record, setRecord] = useState({ visitDate: "", diagnosis: "", treatment: "", vetName: "", prescriptions: "" });

  const handleChange = e => setRecord({ ...record, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ownerId = sessionStorage.getItem("ownerId");
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const payload = {
        ...record,
        // Standard payload: Date + associated entities
        pet: { id: parseInt(petId) },
        // Only send owner if ownerId is present
        ...(ownerId && { owner: { id: parseInt(ownerId) } })
      };

      console.log("Saving Medical Record. Payload:", payload);

      await axios.post("/medical", payload);
      alert("Medical record saved successfully!");
      setRecord({ visitDate: "", diagnosis: "", treatment: "", vetName: "", prescriptions: "" });
      if (refresh) refresh();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      console.error("Save medical record error detail:", errorMsg);

      if (err.response?.status === 403) {
        alert("Permission Denied (403): Your account role 'OWNER' might not have permission to add medical records. Please check backend SecurityConfig.");
      } else {
        alert(`Failed to save record: ${errorMsg}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ background: "var(--bg-input)", border: "none" }}>
      <h4 style={{ marginBottom: "1rem" }}>Add Medical Record</h4>
      <div className="grid grid-cols-2 gap-md">
        <div className="form-group">
          <label className="form-label">Visit Date</label>
          <input type="date" className="form-control" name="visitDate" value={record.visitDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Veterinarian</label>
          <input className="form-control" name="vetName" placeholder="Dr. Name" value={record.vetName} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Diagnosis</label>
        <input className="form-control" name="diagnosis" placeholder="What was diagnosed?" value={record.diagnosis} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label className="form-label">Treatment</label>
        <input className="form-control" name="treatment" placeholder="Treatment given" value={record.treatment} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">Prescriptions</label>
        <input className="form-control" name="prescriptions" placeholder="Meds prescribed" value={record.prescriptions} onChange={handleChange} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
        <button type="submit" className="btn btn-primary" style={{ width: "250px" }}>Save Record</button>
      </div>
    </form>
  );
}
