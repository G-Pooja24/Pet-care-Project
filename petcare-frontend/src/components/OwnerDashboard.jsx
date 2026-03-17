import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OwnerProfile from "./OwnerProfile";
import PetList from "./PetList";
import AppointmentList from "./AppointmentList";
import MedicalRecords from "./MedicalRecords";
import api from "../api/axios";
import "./OwnerDashboard.css";
import "./Sidebar.css";

export default function OwnerDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    pets: 0,
    appointments: 0,
    upcoming: 0,
    vaccinations: 0 // Placeholder until supported
  });
  const [ownerName, setOwnerName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveSection(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ownerId = sessionStorage.getItem("ownerId");
      if (!ownerId) {
        // Retrieve profile if ID missing (re-login scenario)
        const res = await api.get("/owner/profile");
        sessionStorage.setItem("ownerId", res.data.id);
        setOwnerName(res.data.name);
      } else {
        const res = await api.get("/owner/profile");
        setOwnerName(res.data.name);
      }

      // Fetch Stats
      const petsRes = await api.get("/pets/my-pets");
      const appsRes = await api.get("/appointments");

      const pets = petsRes.data;
      const petsCount = pets.length;
      const totalApps = appsRes.data.length;
      const upcoming = appsRes.data.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length;

      // Calculate Vaccinations Due
      let vaccinationsDueCount = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch vaccinations for each pet
      await Promise.all(pets.map(async (pet) => {
        try {
          const vacRes = await api.get(`/vaccinations/pet/${pet.id}`);
          const vacs = vacRes.data.data || vacRes.data || [];

          if (Array.isArray(vacs)) {
            const due = vacs.filter(v => {
              const dateStr = v.nextDueDate || v.next_due_date || v.dueDate || v.nextDue || v.next_due;
              if (!dateStr) return false;
              const d = new Date(dateStr);
              return d >= today;
            }).length;
            vaccinationsDueCount += due;
          }
        } catch (err) {
          console.warn(`Failed to load vaccinations for pet ${pet.id}`, err);
        }
      }));

      setStats({
        pets: petsCount,
        appointments: totalApps,
        upcoming: upcoming,
        vaccinations: vaccinationsDueCount
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return <OwnerProfile />;
      case 'pets': return <PetList />;
      case 'appointments': return <AppointmentList />;
      case 'medical': return <MedicalRecords />;
      case 'dashboard':
      default:
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon bg-purple">🐾</div>
                <div className="stat-info">
                  <h3>{stats.pets}</h3>
                  <p>My Pets</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-blue">📅</div>
                <div className="stat-info">
                  <h3>{stats.upcoming}</h3>
                  <p>Upcoming Visits</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-green">✅</div>
                <div className="stat-info">
                  <h3>{stats.appointments}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              {/* Future Feature */}
              <div className="stat-card">
                <div className="stat-icon bg-orange">💉</div>
                <div className="stat-info">
                  <h3>{stats.vaccinations}</h3>
                  <p>Vaccinations Due</p>
                </div>
              </div>
            </div>

            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <div className="action-card" onClick={() => navigate('/find-vet')}>
                <span style={{ fontSize: '24px' }}>🔍</span>
                <h4>Find a Vet</h4>
                <p>Book a new appointment</p>
              </div>
              <div className="action-card" onClick={() => setActiveSection('pets')}>
                <span style={{ fontSize: '24px' }}>🐶</span>
                <h4>Add New Pet</h4>
                <p>Register a furry friend</p>
              </div>
              <div className="action-card" onClick={() => setActiveSection('profile')}>
                <span style={{ fontSize: '24px' }}>📝</span>
                <h4>Update Profile</h4>
                <p>Keep details current</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="owner-dashboard-layout">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>My Dashboard</h3>
          <p>Welcome, {ownerName || 'Pet Parent'}</p>
        </div>
        <ul className="sidebar-nav">
          <li
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span>📊</span> Dashboard
          </li>
          <li
            className={`nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <span>👤</span> My Profile
          </li>
          <li
            className={`nav-item ${activeSection === "pets" ? "active" : ""}`}
            onClick={() => setActiveSection("pets")}
          >
            <span>🐾</span> My Pets
          </li>
          <li
            className={`nav-item ${activeSection === "appointments" ? "active" : ""}`}
            onClick={() => setActiveSection("appointments")}
          >
            <span>📅</span> Appointments
          </li>
          <li
            className={`nav-item ${activeSection === "medical" ? "active" : ""}`}
            onClick={() => setActiveSection("medical")}
          >
            <span>🏥</span> Medical Records
          </li>
          <li className="nav-item logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="owner-dashboard-main">
        {/* Header removed as per user request */}

        {activeSection === 'dashboard' ? renderContent() : (
          <div className="dashboard-content-wrapper">
            {renderContent()}
          </div>
        )}
      </main>
    </div>
  );
}

