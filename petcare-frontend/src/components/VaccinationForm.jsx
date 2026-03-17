import React, { useState } from "react";
import axios from "../api/axios";

export default function VaccinationForm({ petId, refresh }) {
  const [vaccine, setVaccine] = useState({ vaccineName: "", dateGiven: "", nextDueDate: "" });

  const handleChange = e => setVaccine({ ...vaccine, [e.target.name]: e.target.value });

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
        ...vaccine,
        // Standard payload: Date + associated entities
        pet: { id: parseInt(petId) },
        // Only send owner if ownerId is present
        ...(ownerId && { owner: { id: parseInt(ownerId) } })
      };

      console.log("Saving Vaccination Record. Payload:", payload);

      await axios.post("/vaccinations", payload);
      alert("Vaccination record saved successfully!");
      setVaccine({ vaccineName: "", dateGiven: "", nextDueDate: "" });
      if (refresh) refresh();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      console.error("Save vaccination record error detail:", errorMsg);

      if (err.response?.status === 403) {
        alert("Permission Denied (403): Your account role might not have permission to add vaccination records. Please check backend SecurityConfig.");
      } else if (err.response?.status === 404) {
        alert("Endpoint Not Found (404): The /api/vaccinations endpoint might not be implemented correctly on the backend.");
      } else {
        alert(`Failed to save record: ${errorMsg}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ background: "var(--bg-input)", border: "none" }}>
      <h4 style={{ marginBottom: "1rem" }}>Add Vaccination</h4>
      <div className="grid grid-cols-2 gap-md">
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Vaccine Name</label>
          <input className="form-control" name="vaccineName" placeholder="e.g. Rabies" value={vaccine.vaccineName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Date Given</label>
          <input type="date" className="form-control" name="dateGiven" value={vaccine.dateGiven} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Next Due Date</label>
          <input type="date" className="form-control" name="nextDueDate" value={vaccine.nextDueDate} onChange={handleChange} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
        <button type="submit" className="btn btn-primary" style={{ width: "250px" }}>Add Vaccination</button>
      </div>
    </form>
  );
}
