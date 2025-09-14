import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import "./App.css";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import BuyerDashboard from "./Components/BuyerDashboard";
import MakerDashboard from "./Components/MakerDashboard";
import React, { useEffect, useState } from "react";
import axios from "axios";
import SubscriptionPage from "./Components/SubscriptionPage";

import CancellationRefunds from "./Pages/CancellationRefunds";
import ContactUs from "./Pages/ContactUs";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import ShippingPolicy from "./Pages/ShippingPolicy";
import TermsAndConditions from "./Pages/TermsAndConditions";

import BuyerProfile from "./Components/BuyerProfile";
import MakerProfile from "./Components/MakerProfile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // ✅ only restore if rememberMe was checked
      if (user.isAuthenticated && user.rememberMe) {
        setIsAuthenticated(true);
        setUserRole(user.role);
        return;
      } else {
        // clear non-remembered session
        localStorage.removeItem("user");
      }
    }

    // fallback to backend session
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8000/auth/me/", {
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(res.data.role);
          localStorage.setItem(
            "user",
            JSON.stringify({
              isAuthenticated: true,
              role: res.data.role,
              rememberMe: true, // backend session = persistent
            })
          );
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    };

    checkAuth();
  }, []);

  return (
    <Routes>
      {/* <Route
        path="/"
        element={
          isAuthenticated ? (
            userRole === "maker" ? (
              <Navigate to="/maker-dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <LandingPage />
          )
        }
      /> */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={userRole === "maker" ? "/maker-dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate
              to={userRole === "maker" ? "/maker-dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <Signup />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated && userRole === "buyer" ? (
            <BuyerDashboard
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/maker-dashboard"
        element={
          isAuthenticated && userRole === "maker" ? (
            <MakerDashboard
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/subscription"
        element={
          isAuthenticated ? (
            <SubscriptionPage
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/shipping" element={<ShippingPolicy />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/cancellation" element={<CancellationRefunds />} />
      <Route path="/buyerprofile" element={<BuyerProfile />} />
      <Route path="/makerprofile" element={<MakerProfile />} />
    </Routes>
  );
}

export default App;
