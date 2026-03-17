import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { getPhotoUrl } from "../utils/imageUtils";
import "./PetList.css";

export default function PetList() {
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const ownerId = sessionStorage.getItem("ownerId");

  useEffect(() => {
    if (!ownerId) {
      setError("User ID not found. Please Logout and Login again.");
      return;
    }

    // Use new smart endpoint that checks both User ID and Owner ID
    axios.get("/pets/my-pets")
      .then(res => {
        // console.log("Pets Data:", res.data);
        setPets(res.data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load pets. " + (err.message || "Server Error"));
      });
  }, [ownerId]);

  const getAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + " yrs";
  };



  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Delete this pet?")) return;
    try {
      await axios.delete(`/pets/${id}`);
      setPets(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>

      {error && (
        <div className="alert-error" style={{ background: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #fca5a5" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Info */}


      <div className="pet-list-header">
        <div>
          <h2>My Pets</h2>
          <p className="text-muted">You have {pets.length} pets registered</p>
        </div>
        <Link to="/add" className="add-pet-btn">
          + Add New Pet
        </Link>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, species..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
      </div>

      {pets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "5rem", background: "rgba(255,255,255,0.5)", border: "2px dashed var(--border-color)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🐾</div>
          <h3>No pets found</h3>
          <p className="text-muted">Start by adding your first furry friend!</p>
          <Link to="/add" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>Add Pet Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-lg">
          {pets
            .filter(pet => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return (
                pet.name?.toLowerCase().includes(q) ||
                pet.species?.toLowerCase().includes(q) ||
                pet.breed?.toLowerCase().includes(q)
              );
            })
            .map(pet => (
              <Link to={`/pets/${pet.id}`} key={pet.id} className="card" style={{ display: "block", color: "inherit", overflow: "hidden", padding: "0" }}>
                <div style={{ height: "240px", background: "var(--bg-body)", position: "relative" }}>
                  {pet.photo ? (
                    <img
                      src={getPhotoUrl(pet.photo)}
                      alt={pet.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        console.error("Image failed to load:", e.target.src);
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23aaaaaa'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>🐾</div>
                  )}
                  <div style={{ position: "absolute", top: "15px", right: "15px", background: "white", padding: "4px 12px", borderRadius: "20px", fontWeight: "600", fontSize: "0.8rem", boxShadow: "var(--shadow-sm)" }}>
                    {pet.gender}
                  </div>
                </div>

                <div style={{ padding: "1.5rem" }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: "0", fontSize: "1.4rem" }}>{pet.name}</h3>
                    <span style={{ color: "var(--primary)", fontWeight: "700" }}>{getAge(pet.dob)}</span>
                  </div>
                  <p className="text-muted text-sm" style={{ marginBottom: "1.5rem" }}>{pet.breed || "Purebred"} • {pet.type || "Pet"}</p>


                  <div className="flex gap-sm">
                    <Link
                      to={`/edit-pet/${pet.id}`}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "0.9rem" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "0.9rem", background: "#FFE5E5", color: "#FF4747" }}
                      onClick={(e) => handleDelete(e, pet.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
