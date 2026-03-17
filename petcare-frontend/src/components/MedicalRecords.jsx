import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './MedicalRecords.css';

export default function MedicalRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch appointments/records
            const recordsRes = await api.get('/appointments');
            const allAppointments = recordsRes.data;

            // Fetch owner's pets to resolve names if missing in appointment
            const petsRes = await api.get('/pets/my-pets');
            const pets = petsRes.data;
            const petsMap = {};
            pets.forEach(pet => {
                petsMap[pet.id] = pet;
            });

            // Filter for records that have actual medical data or are completed
            const medicalHistory = allAppointments.filter(app =>
                app.status === 'COMPLETED' ||
                (app.consultationNotes && app.consultationNotes.length > 0) ||
                (app.prescription && app.prescription.length > 0)
            );

            // Sort by date descending
            medicalHistory.sort((a, b) => {
                const dateA = new Date(a.date || a.slot?.date || 0);
                const dateB = new Date(b.date || b.slot?.date || 0);
                return dateB - dateA;
            });

            // Enhance records with pet info from map if needed
            const enhancedRecords = medicalHistory.map(record => {
                const associatedPet = petsMap[record.petId];
                return {
                    ...record,
                    pet: record.pet || associatedPet, // Fallback to local lookup
                    petName: record.petName || (record.pet?.name || associatedPet?.name)
                };
            });

            setRecords(enhancedRecords);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching medical records:", err);
            setLoading(false);
        }
    };

    const formatDate = (dateString, slotDate) => {
        const d = dateString || slotDate;
        if (!d) return null;
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return null;
        return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) return <div className="loader">Loading medical records...</div>;

    return (
        <div className="medical-records-container">
            <div className="medical-header">
                {/* ...header content... */}
                <h2>🏥 Pet Medical Records</h2>
                <p>History of consultations and prescriptions</p>
            </div>

            {records.length === 0 ? (
                <div className="empty-records">
                    <span className="empty-icon">📋</span>
                    <h3>No medical records found</h3>
                    <p>Completed appointments with prescriptions will appear here.</p>
                </div>
            ) : (
                <div className="records-grid">
                    {records.map(record => {
                        // Fallback for pet name
                        const petName = record.petName || record.pet?.name || "Unknown Pet";
                        const petSpecies = record.pet?.species || "Pet";
                        const formattedDate = formatDate(record.date, record.slot?.date);

                        return (
                            <div key={record.id} className="record-card">
                                <div className="card-top-accent"></div>
                                <div className="record-header">
                                    <div className="vet-profile">
                                        <div className="vet-avatar">
                                            {/* Placeholder for Vet Image - using initials if no image */}
                                            <span className="vet-initials">
                                                {(record.vetName || "Dr")[3] || "D"}
                                            </span>
                                        </div>
                                        <div className="vet-details">
                                            <h4>{record.vetName || record.vet?.name || "Unknown Vet"}</h4>
                                            <span className="clinic-name">
                                                <i className="fas fa-hospital-alt"></i> {record.clinicName || record.vet?.clinicName || "Pawfect Care Clinic"}
                                            </span>
                                        </div>
                                    </div>
                                    {formattedDate && (
                                        <span className="record-date">
                                            {formattedDate}
                                        </span>
                                    )}
                                </div>

                                <div className="record-body">
                                    <div className="section-block">
                                        <span className="section-label">Diagnosis / Notes</span>
                                        <p className="section-text">
                                            {record.consultationNotes || "No notes recorded."}
                                        </p>
                                    </div>

                                    <div className="section-block">
                                        <span className="section-label">Prescription</span>
                                        <div className="prescription-box">
                                            {record.prescription ? (
                                                <>
                                                    <span className="rx-icon">💊</span>
                                                    <span>{record.prescription}</span>
                                                </>
                                            ) : (
                                                <span className="text-muted">No prescription added.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="record-footer">
                                    <div className="patient-info">
                                        <span className="patient-label">Patient:</span>
                                        <span className="patient-name">{petName}</span>
                                        <span className="patient-species">{record.pet?.species || "Pet"}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
