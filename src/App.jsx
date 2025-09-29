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

import { Settings } from "lucide-react";

import CancellationRefunds from "./Pages/CancellationRefunds";
import ContactUs from "./Pages/ContactUs";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import ShippingPolicy from "./Pages/ShippingPolicy";
import TermsAndConditions from "./Pages/TermsAndConditions";

import ProjectDetail from "./Components/ProjectDetail";
import BuyerProfile from "./Components/BuyerProfile";
import MakerProfile from "./Components/MakerProfile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const API_HOST = import.meta.env.VITE_API_HOST;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let shouldUseStoredAuth = false;

        if (storedUser) {
          const user = JSON.parse(storedUser);
          shouldUseStoredAuth = user.rememberMe;
        }

        const res = await axios.get(API_HOST + "/auth/me/", {
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
              rememberMe: shouldUseStoredAuth,
            })
          );
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);

        // Remove the HTML preloader here
        const preloader = document.getElementById("preloader");
        if (preloader) preloader.remove();
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        {/* Rotating gear icon */}
        <Settings
          size={60}
          color="#1e90ff"
          style={{ animation: "spin 3s linear infinite" }}
        />

        {/* Loading text */}
        <p className="mt-4 text-blue-600 text-lg font-medium">
          Getting Your Site Ready...
        </p>

        {/* Inline keyframes for spin */}
        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route
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
      />

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

      <Route
        path="/project/:projectId"
        element={
          isAuthenticated && userRole === "maker" ? (
            <ProjectDetail
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

      <Route
        path="/buyerprofile"
        element={
          isAuthenticated && userRole === "buyer" ? (
            <BuyerProfile
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/makerprofile"
        element={
          isAuthenticated && userRole === "maker" ? (
            <MakerProfile
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
