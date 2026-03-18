import React, { useState } from "react";
import axios from "../api/axios";

export default function ReminderForm({ petId, refresh }) {
  const [reminder, setReminder] = useState({ type: "CHECKUP", dueDate: "", repeatRule: "NONE" });

  const handleChange = e => setReminder({ ...reminder, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    axios.post("/reminders", { ...reminder, pet: { id: petId } })
      .then(() => {
        alert("Reminder added successfully!");
        refresh();
        setReminder({ type: "CHECKUP", dueDate: "", repeatRule: "NONE" });
      })
      .catch(err => {
        console.log(err);
        alert("Failed to add reminder. Please check the console for details.");
      });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ background: "var(--bg-input)", border: "none" }}>
      <h4 style={{ marginBottom: "1rem" }}>Set Reminder</h4>
      <div className="grid grid-cols-3 gap-md">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-control" name="type" value={reminder.type} onChange={handleChange}>
            <option value="CHECKUP">Checkup</option>
            <option value="VACCINATION">Vaccination</option>
            <option value="GROOMING">Grooming</option>
            <option value="MEDICATION">Medication</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-control" name="dueDate" value={reminder.dueDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Repeat</label>
          <select className="form-control" name="repeatRule" value={reminder.repeatRule} onChange={handleChange}>
            <option value="NONE">None</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
        <button type="submit" className="btn btn-primary" style={{ width: "250px" }}>Add Reminder</button>
      </div>
    </form>
  );
}
