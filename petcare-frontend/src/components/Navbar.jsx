import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Profile dropdown toggle
  const dropdownRef = useRef(null);
  const { cartCount } = useCart();

  const name = sessionStorage.getItem("name");
  const role = sessionStorage.getItem("role");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smooth scroll handler
  const scrollToSection = (sectionId) => {
    setIsOpen(false); // Close mobile menu if open

    // If not on home page, navigate first
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 300); // Small delay to allow home page to mount
    } else {
      // Already on home page
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  const goToDashboard = () => {
    setIsDropdownOpen(false);
    if (role === "OWNER") navigate("/owner/dashboard");
    else if (role === "VETERINARIAN") navigate("/vet/dashboard");
    else if (role === "ADMIN") navigate("/admin/dashboard");
  };

  const goToProfile = () => {
    setIsDropdownOpen(false);
    if (role === "OWNER") navigate("/owner/profile", { state: { activeTab: "profile" } });
    else if (role === "VETERINARIAN") navigate("/vet/profile");
    // Admin profile not implemented yet, do nothing or go to dashboard
  };

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        await axios.post("http://localhost:9090/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      sessionStorage.clear();
      setIsDropdownOpen(false);
      window.location.href = "/login";
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">🐾</span>
        <span>Pawfect</span>Care
      </Link>

      <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className={`bar ${isOpen ? "open" : ""}`} style={isOpen ? { transform: 'rotate(45deg) translate(5px, 6px)' } : {}}></span>
        <span className={`bar ${isOpen ? "open" : ""}`} style={isOpen ? { opacity: 0 } : {}}></span>
        <span className={`bar ${isOpen ? "open" : ""}`} style={isOpen ? { transform: 'rotate(-45deg) translate(5px, -6px)' } : {}}></span>
      </div>

      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li className="navbar-item">
          <span onClick={() => scrollToSection("home")} className="nav-link">Home</span>
        </li>
        <li className="navbar-item">
          <Link to="/shop" className="nav-link">Marketplace</Link>
        </li>
        <li className="navbar-item">
          <span onClick={() => scrollToSection("about")} className="nav-link">About</span>
        </li>
        <li className="navbar-item">
          <span onClick={() => scrollToSection("services")} className="nav-link">Services</span>
        </li>
        <li className="navbar-item">
          <span onClick={() => scrollToSection("contact")} className="nav-link">Contact</span>
        </li>
      </ul>

      <div className="nav-right">
        {/* Cart Icon */}
        {/* Cart Icon - Only show if logged in */}
        {name && (
          <Link to="/cart" className="nav-link" style={{ marginRight: '1rem', position: 'relative' }}>
            🛒
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.7rem'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {!name ? (
          <Link to="/login" className="login-btn">Login</Link>
        ) : (
          <div ref={dropdownRef} className="profile-container">
            <div className="avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {name.charAt(0).toUpperCase()}
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="user-name">{name}</p>
                  <p className="user-role">{role}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={goToDashboard}>
                  <span className="icon">📊</span> Dashboard
                </button>
                {role !== "ADMIN" && (
                  <button className="dropdown-item" onClick={goToProfile}>
                    <span className="icon">👤</span> My Profile
                  </button>
                )}
                {role === "OWNER" && (
                  <Link to="/orders" className="dropdown-item" onClick={() => setIsDropdownOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="icon">📦</span> My Orders
                  </Link>
                )}
                {role === "ADMIN" && (
                  <>
                    <Link to="/admin/products" className="dropdown-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                      📦 Products
                    </Link>
                    <Link to="/admin/orders" className="dropdown-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                      🚚 Orders
                    </Link>
                  </>
                )}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="icon">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

