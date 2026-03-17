import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { getPhotoUrl } from "../utils/imageUtils";
import { AuthContext } from "../context/AuthContext";
import "./OwnerProfile.css"; // Ensure CSS is imported

const OwnerProfile = () => {
  const { user } = useContext(AuthContext);
  const token = user?.token || sessionStorage.getItem("token");

  const [profile, setProfile] = useState({ name: "", phone: "", address: "", photo: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get("/owner/profile")
        .then(res => {
          if (res.data) {
            setProfile(res.data);
            setError(null);
          }
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load profile.");
        });
    }
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) setProfile(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      if (selectedFile) formData.append("photo", selectedFile);

      await axios.put("/owner/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed!");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        {/* Header Section: Image + Title Side-by-Side */}
        <div className="profile-header-section">
          {error && <div style={{ color: "red", marginBottom: "10px", width: "100%" }}>{error}</div>}
          <div className="profile-image-container">
            {profile.photo ? (
              <img src={getPhotoUrl(profile.photo)} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">{profile.name?.charAt(0)?.toUpperCase() || "U"}</div>
            )}
            <label className="camera-icon">
              <span>📷</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>

          <div className="profile-title">
            <h2>My Profile</h2>
            <p>Manage your personal information</p>
          </div>
        </div>

        {/* Form Section: Grid Layout */}
        <form onSubmit={handleUpdate} className="profile-form-grid">
          {/* Row 1: Name & Phone */}
          <div className="profile-form-group">
            <label className="profile-label">Full Name</label>
            <input
              className="profile-input"
              placeholder="e.g. John Doe"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-label">Phone Number</label>
            <input
              className="profile-input"
              placeholder="+91 98765 43210"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          {/* Row 2: Email (Full Width) */}
          <div className="profile-form-group grid-col-2">
            <label className="profile-label">Email Address</label>
            <input
              className="profile-input"
              value={user?.email || ""}
              disabled
            />
          </div>

          {/* Row 3: Address (Full Width) */}
          <div className="profile-form-group grid-col-2">
            <label className="profile-label">Address</label>
            <textarea
              className="profile-input"
              rows="2"
              placeholder="Enter your complete address"
              value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              style={{ resize: "none" }}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="profile-save-btn" disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerProfile;
