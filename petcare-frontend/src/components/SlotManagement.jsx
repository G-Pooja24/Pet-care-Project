import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './SlotManagement.css';

export default function SlotManagement() {
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]); // Add appointments state
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        mode: 'CLINIC', // CLINIC or ONLINE
        capacity: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSlots();
        fetchAppointments(); // Fetch appointments too
    }, []);

    const fetchSlots = async () => {
        try {
            const response = await api.get('/vets/slots');
            setSlots(response.data);
        } catch (err) {
            console.error("Error fetching slots:", err);
            // setError("Failed to load slots."); // Optional: show error on load
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Basic validation
        if (!formData.date || !formData.startTime || !formData.endTime) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        try {
            // Combine date and time to ISO strings if needed, or send as is depending on backend
            // Assuming backend expects: { date, startTime, endTime, mode, capacity }
            await api.post('/vets/slots', formData);
            setSuccess("Slot created successfully!");
            fetchSlots(); // Refresh list
            fetchAppointments(); // Refresh appointments
            setFormData({
                date: '',
                startTime: '',
                endTime: '',
                mode: 'CLINIC',
                capacity: 1
            });
        } catch (err) {
            console.error("Error creating slot:", err);
            setError(err.response?.data?.message || "Failed to create slot.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="slot-management-container">
            <h2 className="page-title">Manage Availability Slots</h2>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <div className="slot-form-card">
                <h3 className="form-title">Create New Slot</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                name="date"
                                className="modern-input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mode</label>
                            <select
                                name="mode"
                                className="modern-select"
                                value={formData.mode}
                                onChange={handleChange}
                            >
                                <option value="CLINIC">In-Clinic</option>
                                <option value="ONLINE">Video Consultation</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                className="modern-input"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                className="modern-input"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Capacity (Appointments)</label>
                            <input
                                type="number"
                                name="capacity"
                                className="modern-input"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Creating...' : '+ Create Slot'}
                    </button>
                </form>
            </div>

            <div className="slots-list-section">
                <h3 className="list-title">My Slots</h3>
                {slots.length === 0 ? (
                    <p className="text-muted">No availability slots created yet.</p>
                ) : (
                    <div className="table-container">
                        <table className="slots-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Mode</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slots.filter(slot => {
                                    // Calculate expiry logic to filter
                                    const endTerm = slot.endTime && (slot.endTime.includes(' ') || slot.endTime.includes('-'))
                                        ? slot.endTime
                                        : `${slot.date} ${slot.endTime}`;

                                    // Parse date carefully
                                    const endDate = new Date(endTerm);
                                    const now = new Date();

                                    // Filter out if end date is in the past
                                    // User asked to remove timeslots "after the given time slot", implying past slots.
                                    return endDate >= now;
                                }).map((slot) => {
                                    // Calculate booked count manually from appointments since backend might be stale
                                    const bookedCount = appointments.filter(app =>
                                        app.slot && app.slot.id === slot.id && app.status === 'CONFIRMED'
                                    ).length;

                                    // Use the larger of backend count or manual count to be safe
                                    const effectiveBookedCount = Math.max(slot.bookedCount || 0, bookedCount);

                                    const isFull = effectiveBookedCount >= slot.capacity;

                                    return (
                                        <tr key={slot.id || Math.random()}>
                                            <td>{slot.date}</td>
                                            <td>{slot.startTime} - {slot.endTime}</td>
                                            <td>
                                                <span className="mode-text">{slot.mode === 'CLINIC' ? '🏥 In-Clinic' : '💻 Online'}</span>
                                            </td>
                                            <td>{effectiveBookedCount} / {slot.capacity}</td>
                                            <td>
                                                {!isFull ? (
                                                    <span className="status-badge status-active">Active</span>
                                                ) : (
                                                    <span className="status-badge status-booked">Booked</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
