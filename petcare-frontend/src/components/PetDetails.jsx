import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { getPhotoUrl } from "../utils/imageUtils";
import HealthChart from "./HealthChart";
import MedicalForm from "./MedicalForm";
import VaccinationForm from "./VaccinationForm";
import HealthForm from "./HealthForm";
import ReminderForm from "./ReminderForm";

export default function PetDetails() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");
  const [medical, setMedical] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const ownerId = sessionStorage.getItem("ownerId");
      console.log(`[DEBUG] PetDetails for ID: ${id}, OwnerID: ${ownerId}`);

      if (!id) return;
      setLoading(true);
      setError(null);

      const normalizePet = (raw) => ({
        ...raw,
        id: raw.id || id,
        name: raw.name || "Unnamed Pet",
        species: raw.species || raw.type || "Pet",
        breed: raw.breed || "Purebred",
        gender: raw.gender || "Not Specified",
        dob: raw.dob || raw.dateOfBirth || "N/A",
        microchipId: raw.microchipId || "Not Registered",
        notes: raw.notes || "No notes available.",
        photo: raw.photo || null
      });

      // 1. Try to fetch the specific pet
      try {
        const petRes = await axios.get(`/pets/${id}`);
        const raw = petRes.data.data || petRes.data.pet || petRes.data;
        if (raw && (raw.id || raw.name)) {
          console.log("Pet fetched successfully via direct API");
          setPet(normalizePet(raw));
          setLoading(false);
        } else {
          throw new Error("No data returned");
        }
      } catch (err) {
        console.warn(`Direct fetch for pet ${id} failed. Trying fallback from owner list...`);

        // 2. Fallback: Try to find pet in owner's list
        try {
          const ownerId = sessionStorage.getItem("ownerId");
          if (ownerId) {
            const listRes = await axios.get(`/pets/owner/${ownerId}`);
            const pets = listRes.data.data || listRes.data;
            const found = pets.find(p => String(p.id) === String(id));
            if (found) {
              console.log("Pet found via owner list fallback");
              setPet(normalizePet(found));
              setLoading(false);
            } else {
              setError("Pet not found in your collection.");
            }
          } else {
            setError("Owner session expired. Please log in again.");
          }
        } catch (fallbackErr) {
          setError("Failed to load pet details. The backend endpoint might be missing or restricted.");
        }
      }

      // 3. Fetch secondary data
      const secondaries = [
        { url: `/medical/pet/${id}`, setter: setMedical, name: "Medical" },
        { url: `/vaccinations/pet/${id}`, setter: setVaccinations, name: "Vaccines" },
        { url: `/health/pet/${id}`, setter: setMeasurements, name: "Vitals" },
        { url: `/reminders/pet/${id}`, setter: setReminders, name: "Reminders" },
      ];

      for (const item of secondaries) {
        try {
          const res = await axios.get(item.url);
          const data = res.data.data || res.data;
          item.setter(Array.isArray(data) ? data : []);
          console.log(`[DEBUG] Fetched ${item.name}:`, data);
        } catch (err) {
          console.warn(`Optional data failed (${item.name}):`, err.response?.status);
          item.setter([]);
        }
      }
    };

    fetchData();
  }, [id]);

  const tabs = [
    { id: "info", label: "Overview", icon: "📋" },
    { id: "medical", label: "Medical History", icon: "🏥" },
    { id: "vaccinations", label: "Vaccinations", icon: "💉" },
    { id: "health", label: "Health & Vitals", icon: "📊" },
    { id: "reminders", label: "Reminders", icon: "⏰" },
  ];


  if (loading) return (
    <div className="container" style={{ textAlign: "center", padding: "5rem" }}>
      <div style={{ fontSize: "2rem", color: "var(--primary)" }}>⌛ Loading Pet Profile...</div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ textAlign: "center", padding: "5rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
      <h3>Resource Missing</h3>
      <p className="text-muted">{error}</p>
      <div style={{ marginTop: "2rem", padding: "1rem", background: "#FFE5E5", borderRadius: "10px", color: "#FF4747", fontSize: "0.9rem" }}>
        <strong>Developer Tip:</strong> Ensure backend has <code>GET /api/pets/{id}</code>
      </div>
      <button className="btn btn-primary" style={{ marginTop: "2rem" }} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div className="card">
        <div className="flex items-center gap-md" style={{ marginBottom: "2rem" }}>
          <div style={{
            width: "150px", height: "150px",
            borderRadius: "50%", background: "#E0E5F2",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem", boxShadow: "var(--shadow-sm)",
            border: "4px solid #FFFFFF", overflow: "hidden"
          }}>
            {pet.photo ? (
              <img
                src={getPhotoUrl(pet.photo)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23aaaaaa'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : "🐾"}
          </div>
          <div>
            <h2 style={{ fontSize: "2.2rem", color: "var(--text-main)", marginBottom: "0.2rem" }}>{pet.name}</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", fontWeight: "500" }}>
              <span style={{ color: "var(--primary)" }}>{pet.species}</span> • {pet.breed || "Purebred"}
            </p>
          </div>
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-content" style={{ minHeight: "300px" }}>
          {["medical", "vaccinations", "health"].includes(tab) && (
            <div className="card section-filter" style={{ marginBottom: "2rem" }}>
              <h4 style={{ marginBottom: "1rem", color: "#0369a1" }}>Filter Records</h4>
              <div className="flex gap-md items-center">
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="text-sm text-muted">Start Date</label>
                  <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="text-sm text-muted">End Date</label>
                  <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "1.4rem" }}
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          {tab === "info" && (
            <div className="grid grid-cols-2 gap-lg">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="form-control" style={{ background: "var(--bg-input)" }}>{pet.gender}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="form-control" style={{ background: "var(--bg-input)" }}>{pet.dob}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Microchip ID</label>
                <div className="form-control" style={{ background: "var(--bg-input)" }}>{pet.microchipId}</div>
              </div>
              <div className="form-group full-width" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Notes</label>
                <div className="form-control" style={{ minHeight: "100px", background: "var(--bg-input)" }}>{pet.notes}</div>
              </div>
            </div>
          )}

          {tab === "medical" && (
            <div>
              <div className="section-form" style={{ marginBottom: "2rem" }}>
                <MedicalForm
                  petId={id}
                  refresh={async () => {
                    try {
                      const res = await axios.get(`/medical/pet/${id}`);
                      const data = res.data.data || res.data;
                      setMedical(Array.isArray(data) ? data : []);
                      console.log("Medical records refreshed:", data);
                    } catch (err) {
                      console.error("Failed to refresh medical records:", err);
                    }
                  }}
                />
              </div>
              <div className="section-history">
                <h3>Records</h3>
                <div className="record-list">
                  {medical.length === 0 && <p className="text-muted">No medical records found.</p>}
                  {medical.filter(m => {
                    if (!startDate && !endDate) return true;
                    const d = new Date(m.visitDate);
                    const start = startDate ? new Date(startDate) : new Date("1900-01-01");
                    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
                    return d >= start && d <= end;
                  }).map(m => (
                    <div key={m.id} className="record-item">
                      <div>
                        <strong>{m.diagnosis}</strong>
                        <p className="text-sm text-muted">{m.visitDate} • Dr. {m.vetName || "Unknown"}</p>
                        {m.treatment && <p className="text-sm">Treatment: {m.treatment}</p>}
                        {m.prescriptions && <p className="text-sm">Prescriptions: {m.prescriptions}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "vaccinations" && (
            <div>
              <div className="section-form" style={{ marginBottom: "2rem" }}>
                <VaccinationForm
                  petId={id}
                  refresh={async () => {
                    try {
                      const res = await axios.get(`/vaccinations/pet/${id}`);
                      const data = res.data.data || res.data;
                      setVaccinations(Array.isArray(data) ? data : []);
                      console.log("Vaccinations refreshed:", data);
                    } catch (err) {
                      console.error("Failed to refresh vaccinations:", err);
                    }
                  }}
                />
              </div>
              <div className="section-history">
                <h3>History</h3>
                <div className="record-list">
                  {vaccinations.length === 0 && <p className="text-muted">No vaccinations recorded.</p>}
                  {vaccinations.filter(v => {
                    if (!startDate && !endDate) return true;
                    const d = new Date(v.dateGiven);
                    const start = startDate ? new Date(startDate) : new Date("1900-01-01");
                    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
                    return d >= start && d <= end;
                  }).map(v => (
                    <div key={v.id} className="record-item">
                      <div>
                        <strong>{v.vaccineName}</strong>
                        <p className="text-sm text-muted">Given: {v.dateGiven}</p>
                        <div style={{ marginTop: "4px" }}>
                          <span className="text-sm text-muted">Next Due: </span>
                          <span className="text-sm" style={{ color: "var(--primary)", fontWeight: "600" }}>
                            {v.nextDueDate || v.next_due_date || v.dueDate || "Not Set"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "health" && (
            <div className="grid grid-cols-2 gap-lg">
              <div>
                <div className="section-form">
                  <HealthForm
                    petId={id}
                    refresh={async () => {
                      try {
                        const res = await axios.get(`/health/pet/${id}`);
                        const data = res.data.data || res.data;
                        setMeasurements(Array.isArray(data) ? data : []);
                        console.log("Health vitals refreshed:", data);
                      } catch (err) {
                        console.error("Failed to refresh health vitals:", err);
                      }
                    }}
                  />
                </div>
                <div className="section-history" style={{ marginTop: "2rem" }}>
                  <div className="record-list">
                    {measurements.filter(m => {
                      if (!startDate && !endDate) return true;
                      const d = new Date(m.measurementDate || m.dateRecorded);
                      const start = startDate ? new Date(startDate) : new Date("1900-01-01");
                      const end = endDate ? new Date(endDate) : new Date("2100-01-01");
                      return d >= start && d <= end;
                    }).map(m => (
                      <div key={m.id} className="record-item">
                        <span>{m.weight} kg</span>
                        <span>{m.temperature} °C</span>
                        <span className="text-sm text-muted">{new Date(m.measurementDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <HealthChart measurements={measurements} />
              </div>
            </div>
          )}

          {tab === "reminders" && (
            <div>
              <div className="section-form" style={{ marginBottom: "2rem" }}>
                <ReminderForm
                  petId={id}
                  refresh={async () => {
                    try {
                      const res = await axios.get(`/reminders/pet/${id}`);
                      const data = res.data.data || res.data;
                      setReminders(Array.isArray(data) ? data : []);
                      console.log("Reminders refreshed:", data);
                    } catch (err) {
                      console.error("Failed to refresh reminders:", err);
                    }
                  }}
                />
              </div>
              <div className="section-history">
                <div className="record-list">
                  {reminders.map(r => (
                    <div key={r.id} className="record-item">
                      <div>
                        <strong>{r.type}</strong>
                        <p className="text-sm text-muted">Due: {r.dueDate}</p>
                      </div>
                      <span className="text-sm">{r.repeatRule !== "None" ? `Repeats: ${r.repeatRule}` : "One-time"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
