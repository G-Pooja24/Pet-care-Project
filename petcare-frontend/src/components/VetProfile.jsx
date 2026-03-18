import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./VetProfile.css";

const VetProfile = () => {
  const { user } = useContext(AuthContext);
  const token = user?.token || sessionStorage.getItem("token") || localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    clinicName: "",
    specialization: "",
    phone: "",
    clinicAddress: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get("/vet/profile")
        .then(res => {
          if (res.data) {
            setProfile(prev => ({
              ...prev,
              ...res.data
            }));
          }
        })
        .catch(err => console.error("Error fetching vet profile", err))
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [token]);

  const handleUpdate = async () => {
    try {
      await axios.put("/vet/profile", profile);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update profile");
    }
  };

  if (initialLoading) {
    return <div className="vet-profile-container">Loading profile...</div>;
  }

  return (
    <div className="vet-profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Veterinarian Profile</h2>
        <p className="profile-subtitle">Manage your professional information and clinic details</p>

        <div className="form-grid">
          <div className="form-group-full">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              placeholder="Full Name"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinic Name</label>
            <input
              className="form-control"
              placeholder="Clinic Name"
              value={profile.clinicName || ''}
              onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input
              className="form-control"
              placeholder="Eg: Surgery, Dentistry"
              value={profile.specialization || ''}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
            />
          </div>

          <div className="form-group-full">
            <label className="form-label">Phone Number</label>
            <input
              className="form-control"
              placeholder="Phone"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="form-group-full">
            <label className="form-label">Clinic Address</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Clinic Address"
              value={profile.clinicAddress || ''}
              onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
            />
          </div>

          <div className="btn-container">
            <button className="save-btn" onClick={handleUpdate}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetProfile;
