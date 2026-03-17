import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import "./PetForm.css";

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ownerId = sessionStorage.getItem("ownerId");

  const [pet, setPet] = useState({
    name: "", species: "", breed: "", dob: "",
    gender: "Male", microchipId: "", notes: "", photo: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (id) {
      // Fetch pet details directly by ID
      axios.get(`/pets/${id}`)
        .then(res => {
          // Handle potential data nesting: res.data.data, res.data.pet, or res.data
          const petData = res.data.data || res.data.pet || res.data;
          if (petData) {
            setPet(prev => ({ ...prev, ...petData }));
          } else {
            console.error("Pet data not found in response");
          }
        })
        .catch(err => {
          console.error("Error fetching pet details:", err);
          alert("Could not fetch pet details. Please try again.");
        });
    }
  }, [id]);

  const handleChange = e => setPet({ ...pet, [e.target.name]: e.target.value });

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file && file.size > 1048576) {
      alert("File too large (>1MB)");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    // Append fields explicitly as requested
    formData.append("ownerId", ownerId); // Using session ownerId
    formData.append("name", pet.name);
    formData.append("species", pet.species);
    formData.append("breed", pet.breed || "");
    formData.append("dob", pet.dob || "");
    formData.append("gender", pet.gender);
    formData.append("microchipId", pet.microchipId || "");
    formData.append("notes", pet.notes || "");

    // Only append photo if it's a new file selected by user
    if (selectedFile) {
      formData.append("photo", selectedFile);
    }

    try {
      // Axios automatically sets Content-Type to multipart/form-data with boundary
      // when the data is a FormData object.
      // Utilizing the interceptor for Authorization.
      if (id) await axios.put(`/pets/${id}`, formData);
      else await axios.post("/pets", formData);

      alert("Pet saved successfully!");
      navigate("/owner/dashboard", { state: { activeTab: "pets" } });
    } catch (err) {
      console.error("Error saving pet:", err);
      // Detailed error logging
      if (err.response) {
        console.error("Server Response:", err.response.data);
        alert(`Failed to save pet: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert("Failed to save pet: Network or Server Error");
      }
    }
  };

  return (
    <div className="container" style={{ marginTop: "1rem", maxWidth: "600px" }}>
      <div className="card" style={{ padding: "1.5rem", background: "#ffffff", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#0284c7" }}>{id ? "Edit Pet Details" : "Add New Pet"}</h2>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>Update your pet's information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-md">
            <div className="form-group">
              <label className="form-label text-sm" style={{ color: "#0f172a" }}>Pet Name</label>
              <input className="form-control" name="name" value={pet.name} onChange={handleChange} required
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }} />
            </div>
            <div className="form-group">
              <label className="form-label text-sm" style={{ color: "#0f172a" }}>Species</label>
              <input className="form-control" name="species" placeholder="e.g. Dog" value={pet.species} onChange={handleChange} required
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }} />
            </div>
            <div className="form-group">
              <label className="form-label text-sm" style={{ color: "#0f172a" }}>Breed</label>
              <input className="form-control" name="breed" value={pet.breed} onChange={handleChange}
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }} />
            </div>
            <div className="form-group">
              <label className="form-label text-sm" style={{ color: "#0f172a" }}>Date of Birth</label>
              <input type="date" className="form-control" name="dob" value={pet.dob} onChange={handleChange}
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }} />
            </div>
            <div className="form-group">
              <label className="form-label text-sm" style={{ color: "#0f172a" }}>Gender</label>
              <select className="form-control" name="gender" value={pet.gender} onChange={handleChange}
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label text-sm" style={{ color: "#0f172a" }}>Microchip ID</label>
              <input className="form-control" name="microchipId" value={pet.microchipId} onChange={handleChange}
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label text-sm" style={{ color: "#0f172a" }}>Pet Photo</label>
            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange}
              style={{ padding: "5px", background: "#f8fafc", border: "1px solid #cbd5e1" }} />
          </div>

          <div className="form-group">
            <label className="form-label text-sm" style={{ color: "#0f172a" }}>Notes</label>
            <textarea className="form-control" rows="2" name="notes" value={pet.notes} onChange={handleChange}
              style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }} />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate("/owner/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {id ? "Update Pet" : "Add Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
