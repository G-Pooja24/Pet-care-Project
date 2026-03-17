import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './AppointmentList.css';
import ConsultationModal from './ConsultationModal';

export default function AppointmentList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const role = sessionStorage.getItem("role"); // "VETERINARIAN" or "OWNER"

    useEffect(() => {
        fetchAppointments();

        // Optional: Refresh every minute to update "Auto-Complete" status based on time
        const interval = setInterval(() => {
            setAppointments(prev => [...prev]); // Trigger re-render to check times
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            // Sort by Date & Time Descending (Newest/Future first)
            const sortedData = response.data.sort((a, b) => {
                const dateA = new Date(`${a.date || a.slot?.date} ${a.time || a.slot?.startTime}`);
                const dateB = new Date(`${b.date || b.slot?.date} ${b.time || b.slot?.startTime}`);
                return dateB - dateA;
            });
            setAppointments(sortedData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setError("Failed to load appointments.");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to cancel this appointment?`)) return;

        try {
            await api.put(`/appointments/${id}/status`, null, { params: { status: newStatus } });
            setAppointments(appointments.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    };

    const confirmAppointment = async (id) => {
        if (!window.confirm("Confirm this appointment? This will send a confirmation email.")) return;

        try {
            // Using specific endpoint to ensure email trigger
            await api.put(`/appointments/${id}/confirm`);
            setAppointments(appointments.map(app =>
                app.id === id ? { ...app, status: 'CONFIRMED' } : app
            ));
        } catch (err) {
            console.error("Error confirming appointment:", err);
            // Fallback to generic status update if specific endpoint fails (optional, but safer to just alert for now)
            alert("Failed to confirm appointment. Please try again.");
        }
    };

    const isAppointmentPast = (app) => {
        const dateStr = app.date || app.slot?.date;
        const timeStr = app.time || app.slot?.startTime; // Expecting "HH:mm" or "HH:mm:ss"

        if (!dateStr || !timeStr) return false;

        try {
            // Construct ISO string YYYY-MM-DDTHH:mm:ss
            const dateTimeStr = `${dateStr}T${timeStr}`;
            const appDate = new Date(dateTimeStr);
            const now = new Date();
            return now > appDate;
        } catch (e) {
            console.error("Date parsing error", e);
            return false;
        }
    };

    const getDisplayStatus = (app) => {
        if (app.status === 'CONFIRMED' && isAppointmentPast(app)) {
            return 'COMPLETED';
        }
        return app.status;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'status-confirmed';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // ... existing useEffect ...

    const handleOpenModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleSaveConsultation = async (id, data) => {
        try {
            // Assuming endpoint exists: PUT /appointments/{id}/consultation
            // If not, we might need to adjust or mock. 
            // Based on previous patterns, we might update the appointment entity.
            await api.put(`/appointments/${id}/consultation`, data);

            // Update local state
            setAppointments(appointments.map(app =>
                app.id === id ? { ...app, ...data } : app
            ));
            alert("Consultation details saved!");
        } catch (error) {
            console.error("Error saving consultation:", error);
            throw error; // Let modal handle loading state removal
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading appointments...</div>;

    return (
        <div className="appointment-list-container">
            <div className="appointment-header-section">
                <h2>My Appointments</h2>
                {role === "OWNER" && (
                    <button
                        className="create-appt-btn"
                        onClick={() => window.location.href = '/find-vet'}
                    >
                        + Create New Appointment
                    </button>
                )}
            </div>

            {appointments.length === 0 ? (
                <div className="empty-state">
                    <p>No appointments found.</p>
                    {role === "OWNER" && (
                        <button
                            className="create-appt-btn"
                            onClick={() => window.location.href = '/find-vet'}
                        >
                            Book your first appointment
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>{role === "OWNER" ? "Veterinarian" : "Owner / Pet"}</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(app => {
                                const displayStatus = getDisplayStatus(app);
                                const isPast = isAppointmentPast(app);
                                const isOnline = (app.mode === 'ONLINE' || app.slot?.mode === 'ONLINE');
                                const canJoinMeeting = isOnline && (app.status === 'CONFIRMED' || displayStatus === 'CONFIRMED');

                                return (
                                    <tr key={app.id}>
                                        <td className="date-cell">
                                            {app.date || app.slot?.date}
                                            <span>{app.time || app.slot?.startTime}</span>
                                        </td>
                                        <td className={role === "OWNER" ? "vet-info-cell" : "owner-info-cell"}>
                                            {role === "OWNER" ? (
                                                <>{app.vetName || app.vet?.name}<small>{app.clinicName || app.vet?.clinicName}</small></>
                                            ) : (
                                                <>{app.ownerName || app.owner?.name}<small>Pet: {app.petName || app.pet?.name}</small></>
                                            )}
                                        </td>
                                        <td>
                                            {app.mode || app.slot?.mode}
                                            {isOnline && <span title="Online Consultation" style={{ marginLeft: '5px' }}>💻</span>}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(displayStatus)}`}>
                                                {displayStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons-container">
                                                {/* JOIN MEETING BUTTON */}
                                                {canJoinMeeting && (
                                                    <button
                                                        className="action-btn btn-join"
                                                        onClick={() => window.open(app.meetingLink || `https://meet.google.com/new`, '_blank')}
                                                        title="Join Online Meeting"
                                                    >
                                                        📹 Join
                                                    </button>
                                                )}

                                                {/* OWNER ACTIONS */}
                                                {role === "OWNER" && (
                                                    <>
                                                        {app.status === 'PENDING' && (
                                                            <button
                                                                className="action-btn btn-cancel"
                                                                onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        {/* View Prescription if available */}
                                                        {/* (displayStatus === 'COMPLETED' || app.consultationNotes) && (
                                                            <button 
                                                                className="action-btn"
                                                                onClick={() => handleOpenModal(app)}
                                                                title="View Notes"
                                                                style={{background: '#3498db', color:'white'}}
                                                            >
                                                                📄 Notes
                                                            </button>
                                                        )*/}
                                                    </>
                                                )}

                                                {/* VET ACTIONS */}
                                                {role === "VETERINARIAN" && (
                                                    <>
                                                        {app.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    className="action-btn btn-confirm"
                                                                    onClick={() => confirmAppointment(app.id)}
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    className="action-btn btn-cancel"
                                                                    onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {app.status === 'CONFIRMED' && (
                                                            <>
                                                                <button
                                                                    className="action-btn btn-notes"
                                                                    onClick={() => handleOpenModal(app)}
                                                                >
                                                                    Notes
                                                                </button>
                                                                {!isPast && (
                                                                    <button
                                                                        className="action-btn btn-cancel"
                                                                        onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                                                        title="Emergency Cancel"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {/* Allow editing notes even if completed */}
                                                        {displayStatus === 'COMPLETED' && (
                                                            <button
                                                                className="action-btn btn-edit-notes"
                                                                onClick={() => handleOpenModal(app)}
                                                            >
                                                                Edit Notes
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Consultation Modal */}
            <ConsultationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                appointment={selectedAppointment}
                role={role}
                onSave={handleSaveConsultation}
            />
        </div>
    );
}

