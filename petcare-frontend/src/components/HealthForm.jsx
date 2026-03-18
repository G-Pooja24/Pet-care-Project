import React, { useState } from "react";
import axios from "../api/axios";

export default function HealthForm({ petId, refresh }) {
  const [measure, setMeasure] = useState({ weight: "", temperature: "", notes: "" });

  const handleChange = e => setMeasure({ ...measure, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    axios.post("/health", { ...measure, pet: { id: petId } })
      .then(() => { refresh(); setMeasure({ weight: "", temperature: "", notes: "" }); })
      .catch(err => console.log(err));
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ background: "var(--bg-input)", border: "none" }}>
      <h4 style={{ marginBottom: "1rem" }}>Log Vitals</h4>
      <div className="grid grid-cols-2 gap-md">
        <div className="form-group">
          <label className="form-label">Weight (kg)</label>
          <input type="number" step="0.1" className="form-control" name="weight" placeholder="0.0" value={measure.weight} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Temperature (°C)</label>
          <input type="number" step="0.1" className="form-control" name="temperature" placeholder="0.0" value={measure.temperature} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <input className="form-control" name="notes" placeholder="Any observation?" value={measure.notes} onChange={handleChange} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
        <button type="submit" className="btn btn-primary" style={{ width: "250px" }}>Log Measurement</button>
      </div>
    </form>
  );
}
