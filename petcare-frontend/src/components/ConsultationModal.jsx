import React, { useState, useEffect } from 'react';
import './ConsultationModal.css';

const ConsultationModal = ({ isOpen, onClose, appointment, role, onSave }) => {
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (appointment) {
            setNotes(appointment.consultationNotes || '');
            setPrescription(appointment.prescription || '');
        }
    }, [appointment]);

    if (!isOpen || !appointment) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(appointment.id, { consultationNotes: notes, prescription });
            onClose();
        } catch (error) {
            console.error("Failed to save consultation details", error);
            alert("Failed to save details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function for formatting
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    // Determine read-only state: Owners can only view, Vets can edit
    const isReadOnly = role === 'OWNER';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isReadOnly ? 'Consultation Details' : 'Add Consultation Details'}</h2>
                    <button className="close-modal-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Updated Info Section with Date Fix */}
                    <div className="info-summary" style={{ background: '#f0f7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #dbeafe' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '600', color: '#1e3a8a' }}>Date:</span>
                            <span style={{ color: '#1e40af' }}>
                                {appointment?.slot?.startTime ? formatDate(appointment.slot.startTime) : (appointment.date || 'Date not available')}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '600', color: '#1e3a8a' }}>Patient:</span>
                            <span style={{ color: '#1e40af' }}>{appointment?.petName || appointment?.pet?.name}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Diagnosis / Consultation Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isReadOnly}
                            placeholder={isReadOnly ? "No notes available." : "Enter diagnosis and observation notes here..."}
                        />
                    </div>

                    <div className="form-group">
                        <label>Prescription</label>
                        <textarea
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            disabled={isReadOnly}
                            placeholder={isReadOnly ? "No prescription available." : "Enter prescribed medicines and dosage..."}
                            style={{ minHeight: '120px' }}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {!isReadOnly && (
                        <button className="btn-primary" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Details'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationModal;
