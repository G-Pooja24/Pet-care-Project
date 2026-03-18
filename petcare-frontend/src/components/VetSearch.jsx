import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './VetSearch.css';

export default function VetSearch() {
    const [vets, setVets] = useState([]);
    const [filteredVets, setFilteredVets] = useState([]);
    const [filters, setFilters] = useState({
        specialization: '',
        city: '',
        petType: 'ALL' // ALL, DOG, CAT, EXOTIC
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const specializations = {
        DOG_CAT: [
            "General Practitioner",
            "Skin & Allergy (Dermatology)",
            "Veterinary Surgeon",
            "Dental & Oral Health",
            "Internal Medicine"
        ],
        EXOTIC: [
            "Avian Specialist (Birds)",
            "Pocket Pets (Hamsters/Rabbits)",
            "Reptile & Amphibian Care"
        ],
        URGENT: [
            "Emergency & Critical Care"
        ]
    };

    useEffect(() => {
        fetchVets();
    }, []);

    const fetchVets = async () => {
        try {
            const response = await api.get('/vets/search');
            setVets(response.data);
            setFilteredVets(response.data);
        } catch (err) {
            console.error("Error fetching vets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters, vets);
    };

    const applyFilters = (currentFilters, currentVets) => {
        let result = currentVets;

        // Filter by Pet Type (Basic mapping logic)
        if (currentFilters.petType !== 'ALL') {
            result = result.filter(vet => {
                const spec = vet.specialization?.toLowerCase() || "";
                if (currentFilters.petType === 'DOG' || currentFilters.petType === 'CAT') {
                    return spec.includes("general") || spec.includes("skin") || spec.includes("surgeon") || spec.includes("dental") || spec.includes("medicine");
                }
                if (currentFilters.petType === 'EXOTIC') {
                    return spec.includes("avian") || spec.includes("pocket") || spec.includes("reptile") || spec.includes("exotic");
                }
                return true;
            });
        }

        if (currentFilters.specialization) {
            result = result.filter(vet =>
                vet.specialization === currentFilters.specialization
            );
        }

        if (currentFilters.city) {
            result = result.filter(vet =>
                vet.clinicAddress?.toLowerCase().includes(currentFilters.city.toLowerCase())
            );
        }
        setFilteredVets(result);
    };

    const handleBack = () => {
        navigate('/owner/dashboard', { state: { activeTab: 'appointments' } });
    };

    return (
        <div className="vet-search-container">
            <div className="search-header">
                <button onClick={handleBack} className="back-btn" title="Back to Appointments">
                    ←
                </button>
                <div className="header-text">
                    <h2>Find a Veterinarian</h2>
                    <p>Search by pet type, specialization, or location</p>
                </div>
            </div>

            <div className="search-section">
                {/* Pet Type Chips */}
                <div className="pet-type-selector">
                    <button
                        className={`type-chip ${filters.petType === 'ALL' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('petType', 'ALL')}
                    >
                        🐾 All Pets
                    </button>
                    <button
                        className={`type-chip ${filters.petType === 'DOG' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('petType', 'DOG')}
                    >
                        🐶 Dogs
                    </button>
                    <button
                        className={`type-chip ${filters.petType === 'CAT' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('petType', 'CAT')}
                    >
                        🐱 Cats
                    </button>
                    <button
                        className={`type-chip ${filters.petType === 'EXOTIC' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('petType', 'EXOTIC')}
                    >
                        🦜 Exotics
                    </button>
                </div>

                <div className="search-filters-bar">
                    <div className="filter-item">
                        <label>What are you looking for?</label>
                        <select
                            name="specialization"
                            value={filters.specialization}
                            onChange={(e) => handleFilterChange('specialization', e.target.value)}
                            className="modern-select"
                        >
                            <option value="">All Specializations</option>
                            <optgroup label="Dogs & Cats">
                                {specializations.DOG_CAT.map(s => <option key={s} value={s}>{s}</option>)}
                            </optgroup>
                            <optgroup label="Birds & Exotic Pets">
                                {specializations.EXOTIC.map(s => <option key={s} value={s}>{s}</option>)}
                            </optgroup>
                            <optgroup label="Urgent Care">
                                {specializations.URGENT.map(s => <option key={s} value={s}>{s}</option>)}
                            </optgroup>
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>Location / City</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="e.g. Hyderabad"
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                            className="modern-input"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Finding the best veterinarians for you...</p>
                </div>
            ) : (
                <div className="vets-list">
                    {filteredVets.length > 0 ? (
                        filteredVets.map(vet => (
                            <div key={vet.id} className="vet-card">
                                <div className="card-top">
                                    <div className="vet-avatar">
                                        {vet.name.charAt(0)}
                                    </div>
                                    <div className="vet-main-info">
                                        <h3>{vet.name}</h3>
                                        <span className="vet-specialty">
                                            {vet.specialization === 'Skin' ? 'Skin & Allergy (Dermatology)' :
                                                vet.specialization === 'Surgery' ? 'Veterinary Surgeon' :
                                                    vet.specialization}
                                        </span>
                                    </div>
                                </div>
                                <div className="vet-details">
                                    <p><span className="icon">🏥</span> {vet.clinicName}</p>
                                    <p><span className="icon">📍</span> {vet.clinicAddress}</p>
                                    <p><span className="icon">📞</span> {vet.phone}</p>
                                </div>
                                <button
                                    className="book-btn"
                                    onClick={() => navigate(`/book-appointment/${vet.id}`)}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-found-8867280-7265556.png" alt="No results" />
                            <p>No veterinarians found matching your search.</p>
                            <button onClick={() => handleFilterChange('petType', 'ALL')} className="reset-btn">Clear all filters</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

