import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './BookAppointment.css';

export default function BookAppointment() {
    const { vetId } = useParams();
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]);
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchData();
    }, [vetId]);

    const fetchData = async () => {
        try {
            const ownerId = sessionStorage.getItem("ownerId");
            if (!ownerId) {
                setError("Please login as an owner to book.");
                setLoading(false);
                return;
            }

            // Fetch Slots
            const slotsRes = await api.get(`/vets/${vetId}/slots`);
            setSlots(slotsRes.data);

            // Fetch Pets
            const petsRes = await api.get("/pets/my-pets");
            setPets(petsRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load availability or pets.");
            setLoading(false);
        }
    };

    const handleBook = async (slotId) => {
        if (!selectedPet) {
            alert("Please select a pet for the appointment.");
            return;
        }
        if (!window.confirm("Confirm booking for this slot?")) return;

        setBooking(true);
        try {
            // Find selected slot to check mode
            const slot = slots.find(s => s.id === slotId);
            let meetingLink = null;
            if (slot && slot.mode === 'ONLINE') {
                // Generate a random meeting ID
                const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                meetingLink = `https://meet.google.com/${meetingId.substring(0, 3)}-${meetingId.substring(3, 7)}-${meetingId.substring(7, 10)}`;
            }

            await api.post('/appointments', {
                slotId: slotId,
                vetId: vetId,
                petId: selectedPet,
                meetingLink: meetingLink // Send generated link
            });
            alert("Appointment booked successfully!");
            navigate('/owner/dashboard', { state: { activeTab: 'appointments' } });
        } catch (err) {
            console.error("Booking error:", err);
            alert(err.response?.data?.message || "Failed to book appointment.");
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <div className="book-appointment-container"><p>Loading details...</p></div>;
    if (error) return <div className="book-appointment-container"><p style={{ color: 'red' }}>{error}</p></div>;

    const availableSlots = slots.filter(slot => {
        const isFull = (slot.bookedCount || 0) >= slot.capacity;

        // Check if slot has expired
        const endTerm = slot.endTime.includes(' ') || slot.endTime.includes('-')
            ? slot.endTime
            : `${slot.date} ${slot.endTime}`;
        const isExpired = new Date(endTerm) < new Date();

        return !isFull && !isExpired;
    });

    return (
        <div className="book-appointment-container">
            <div className="booking-header">
                <button className="back-btn" onClick={() => navigate(-1)} title="Go Back">
                    ←
                </button>
                <h2>Book Appointment</h2>
            </div>

            <div className="pet-selection-section">
                <label className="pet-selection-label">Select Pet for Appointment:</label>
                {pets.length === 0 ? (
                    <p className="no-pets-msg">⚠️ No pets found. Please add a pet in your dashboard first.</p>
                ) : (
                    <>
                        <select
                            className="pet-select"
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                        >
                            <option value="">-- Select a Pet --</option>
                            {pets.map(pet => (
                                <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                            ))}
                        </select>
                        {!selectedPet && (
                            <div className="info-banner" style={{ marginTop: '15px' }}>
                                <p>ℹ️ Please select a pet to see booking options.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="slots-section">
                <h3>Available Slots</h3>
                {availableSlots.length === 0 ? (
                    <div className="no-slots-state">
                        <p>📅 No available slots found for this veterinarian.</p>


                    </div>
                ) : (
                    <div className="slots-grid">
                        {availableSlots.map(slot => (
                            <div key={slot.id} className="slot-card">
                                <span className="slot-date">{slot.date}</span>
                                <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                                <span className="slot-mode">{slot.mode} Consultation</span>

                                <div className="book-slot-btn-wrapper">
                                    <button
                                        onClick={() => handleBook(slot.id)}
                                        disabled={booking || !selectedPet}
                                        className={`book-slot-btn ${!selectedPet ? 'disabled' : 'active'}`}
                                    >
                                        {booking ? 'Processing...' : 'Book Now'}
                                    </button>
                                    {!selectedPet && <span className="tooltip-text">Select a pet first</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

