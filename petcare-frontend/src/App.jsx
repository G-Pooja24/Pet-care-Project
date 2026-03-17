// import React from "react";
// import "./App.css";

// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import Header from "./components/Header";
// import Intro from "./components/Intro";
// import About from "./components/About";
// import Products from "./components/Products";
// import Services from "./components/Services";
// import Testimonials from "./components/Testimonials";
// import Instagram from "./components/Instagram";
// import Footer from "./components/Footer";

// import Login from "./components/Login";
// //import OTPVerify from "./components/OTPVerify";
// import Register from "./components/Register";

// import OwnerDashboard from "./components/OwnerDashboard";
// import VetDashboard from "./components/VetDashboard";
// import OwnerProfile from "./components/OwnerProfile";
// import VetProfile from "./components/VetProfile";

// export default function App() {
//   const role = localStorage.getItem("role");
//   const token = localStorage.getItem("token");

//   return (
//     <Router>
//       <Navbar />

//       <Routes>
//         {/* Home Page */}
//         <Route
//           path="/"
//           element={
//             <div>
//               <Header />
//               <main>
//                 <Intro />
//                 <About />
//                 <Products />
//                 <Services />
//                 <Testimonials />
//                 <Instagram />
//               </main>
//               <Footer />
//             </div>
//           }
//         />

//         {/* Authentication */}
//         <Route path="/login" element={<Login />} />
//    { /*     <Route path="/verify-otp" element={<OTPVerify />} />   */}
//         <Route path="/register" element={<Register />} />

//         {/* Role-based redirect after login */}
//         <Route
//           path="/dashboard"
//           element={
//             token
//               ? role === "OWNER" ? <Navigate to="/owner/dashboard" />
//                 : <Navigate to="/vet/dashboard" />
//               : <Navigate to="/login" />
//           }
//         />

//         {/* Owner routes */}
//         <Route
//           path="/owner/dashboard"
//           element={token && role === "OWNER" ? <OwnerDashboard /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/owner/profile"
//           element={token && role === "OWNER" ? <OwnerProfile /> : <Navigate to="/login" />}
//         />

//         {/* Vet routes */}
//         <Route
//           path="/vet/dashboard"
//           element={token && role === "VETERINARIAN" ? <VetDashboard /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/vet/profile"
//           element={token && role === "VETERINARIAN" ? <VetProfile /> : <Navigate to="/login" />}
//         />

//         {/* Catch-all: redirect unknown routes to home */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }







import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Intro from "./components/Intro";
import About from "./components/About";
import Products from "./components/Products";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import Instagram from "./components/Instagram";
import Footer from "./components/Footer";

import Login from "./components/Login";
import Register from "./components/Register";

import OwnerDashboard from "./components/OwnerDashboard";
import VetDashboard from "./components/VetDashboard";
import OwnerProfile from "./components/OwnerProfile";
import VetProfile from "./components/VetProfile";

// Marketplace Imports
import { CartProvider } from "./context/CartContext";
import ProductList from "./components/Marketplace/ProductList";
import ProductDetail from "./components/Marketplace/ProductDetail";
import Cart from "./components/Marketplace/Cart";
import Checkout from "./components/Marketplace/Checkout";
import OrderHistory from "./components/Marketplace/OrderHistory";
import AdminProductManager from "./components/Admin/AdminProductManager";
import AdminOrderManager from "./components/Admin/AdminOrderManager";
import AdminDashboard from "./components/Admin/AdminDashboard";

import "./chartSetup";

import PetList from './components/PetList';
import PetForm from './components/PetForm';
import PetDetails from './components/PetDetails';
import SlotManagement from './components/SlotManagement';
import AppointmentList from './components/AppointmentList';
import VetSearch from './components/VetSearch';
import BookAppointment from './components/BookAppointment';

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [role, setRole] = useState(sessionStorage.getItem("role"));

  // Update state when sessionStorage changes (optional)
  useEffect(() => {
    const handleStorage = () => {
      setToken(sessionStorage.getItem("token"));
      setRole(sessionStorage.getItem("role"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              <div>
                <Header />
                <main>
                  <section id="home"><Intro /></section>
                  <section id="about"><About /></section>
                  <section id="store"><Products /></section>
                  <section id="services"><Services /></section>
                  <Testimonials />
                  <section id="contact"><Footer /></section>
                  <Instagram />
                </main>
              </div>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<Login onLogin={(token, role) => { setToken(token); setRole(role); }} />} />
          <Route path="/register" element={<Register />} />

          {/* Role-based dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              token
                ? role === "OWNER"
                  ? <Navigate to="/owner/dashboard" />
                  : role === "ADMIN"
                    ? <Navigate to="/admin/dashboard" />
                    : <Navigate to="/vet/dashboard" />
                : <Navigate to="/login" />
            }
          />

          {/* Owner routes */}
          <Route
            path="/owner/dashboard"
            element={token && role === "OWNER" ? <OwnerDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/owner/profile"
            element={token && role === "OWNER" ? <OwnerProfile /> : <Navigate to="/login" />}
          />

          {/* Vet routes */}
          <Route
            path="/vet/dashboard"
            element={token && role === "VETERINARIAN" ? <VetDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/vet/profile"
            element={token && role === "VETERINARIAN" ? <VetProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/vet/slots"
            element={token && role === "VETERINARIAN" ? <SlotManagement /> : <Navigate to="/login" />}
          />
          <Route
            path="/vet/appointments"
            element={token && role === "VETERINARIAN" ? <AppointmentList /> : <Navigate to="/login" />}
          />

          {/* Appointment Scheduling Routes */}
          <Route path="/find-vet" element={token && role === "OWNER" ? <VetSearch /> : <Navigate to="/login" />} />
          <Route path="/book-appointment/:vetId" element={token && role === "OWNER" ? <BookAppointment /> : <Navigate to="/login" />} />
          <Route path="/owner/appointments" element={token && role === "OWNER" ? <AppointmentList /> : <Navigate to="/login" />} />

          {/* Pet Management Routes (Protected) */}
          <Route path="/pets" element={token && role === "OWNER" ? <PetList /> : <Navigate to="/login" />} />
          <Route path="/add" element={token && role === "OWNER" ? <PetForm /> : <Navigate to="/login" />} />
          <Route path="/pets/:id" element={token && role === "OWNER" ? <PetDetails /> : <Navigate to="/login" />} />
          <Route path="/edit-pet/:id" element={token && role === "OWNER" ? <PetForm /> : <Navigate to="/login" />} />

          {/* Marketplace Routes */}
          <Route path="/shop" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
          <Route path="/orders" element={token ? <OrderHistory /> : <Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={token && role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/products" element={token && role === "ADMIN" ? <AdminProductManager /> : <Navigate to="/login" />} />
          <Route path="/admin/orders" element={token && role === "ADMIN" ? <AdminOrderManager /> : <Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

