import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./VetDashboard.css";
import "./Sidebar.css";

// Components
import SlotManagement from "./SlotManagement";
import AppointmentList from "./AppointmentList";
import VetProfile from "./VetProfile"; // Assuming you have/can reuse VetProfile separately or inline it
import NotificationToast from "./NotificationToast";

export default function VetDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    today: 0
  });
  const [profile, setProfile] = useState({ name: "" }); // Minimal profile for header
  const [notifications, setNotifications] = useState([]);
  const [lastTotalCount, setLastTotalCount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();

    // Poll for new appointments every 15 seconds
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [lastTotalCount]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch core profile check
      const profileRes = await api.get("/vet/profile");
      setProfile(profileRes.data);

      // Fetch Appointments to calculate stats
      const appRes = await api.get("/appointments"); // "My Appointments"
      const appointments = appRes.data;

      const total = appointments.length;

      // Check for new bookings to notify
      if (lastTotalCount !== null && total > lastTotalCount) {
        addNotification("New appointment booking received!", "success");
      }
      setLastTotalCount(total);

      const pending = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
      const completed = appointments.filter(a => a.status === 'COMPLETED').length;

      // Calculate today's schedule
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter(a => (a.date === today || a.slot?.date === today)).length;

      setStats({ total, pending, completed, today: todayCount });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        // We can reuse the existing form logic here or import VetProfile component
        // Since VetProfile component already exists and matches the design, let's use it.
        // But the previous implementation of VetDashboard had the form INLINE.
        // I will implement a wrapper for VetProfile or the Inline Form here if VetProfile isn't suitable.
        // Let's assume VetProfile is good or I'll inline the profile form from previous VetDashboard code if needed.
        // Checking file list: VetProfile.jsx exists. 
        return <VetProfile />;
      case 'slots':
        return <SlotManagement />;
      case 'appointments':
        return <AppointmentList />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-home">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total-apps">📊</div>
                <div className="stat-info">
                  <h3>{stats.total}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pending-req">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pending}</h3>
                  <p>Pending / Upcoming</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon completed">✅</div>
                <div className="stat-info">
                  <h3>{stats.completed}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon today-sched">📅</div>
                <div className="stat-info">
                  <h3>{stats.today}</h3>
                  <p>Today's Schedule</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-list">
                <button className="action-btn btn-primary" onClick={() => setActiveSection('slots')}>
                  ➕ Manage Slots
                </button>
                <button className="action-btn btn-secondary" onClick={() => setActiveSection('appointments')}>
                  📋 View Appointments
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="vet-dashboard-layout">
      {/* Notifications */}
      <div className="notification-container">
        {notifications.map(note => (
          <NotificationToast
            key={note.id}
            message={note.message}
            type={note.type}
            onClose={() => removeNotification(note.id)}
          />
        ))}
      </div>

      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>Vet Panel</h3>
          <p>Welcome, {profile.name || 'Doc'}</p>
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
            className={`nav-item ${activeSection === "slots" ? "active" : ""}`}
            onClick={() => setActiveSection("slots")}
          >
            <span>📅</span> Manage Slots
          </li>
          <li
            className={`nav-item ${activeSection === "appointments" ? "active" : ""}`}
            onClick={() => setActiveSection("appointments")}
          >
            <span>🩺</span> Appointments
          </li>
          <li className="nav-item logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="vet-dashboard-main">
        <header className="dashboard-header">
          <h2>
            {activeSection === 'dashboard' && 'Dashboard Overview'}
            {activeSection === 'profile' && 'My Profile'}
            {activeSection === 'slots' && 'Slot Management'}
            {activeSection === 'appointments' && 'Appointment Requests'}
          </h2>
          <p>
            {activeSection === 'dashboard' && 'Welcome back! Here is what’s happening today.'}
            {activeSection === 'profile' && 'Update your clinic details and personal information.'}
            {activeSection === 'slots' && 'Create and manage your availability for appointments.'}
            {activeSection === 'appointments' && 'Track and manage your patient appointments.'}
          </p>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
