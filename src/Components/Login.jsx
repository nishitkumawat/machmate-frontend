import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import machmateLogo from "../assets/logo-dark.png";

const API_HOST = import.meta.env.VITE_API_HOST;

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        API_HOST + "/auth/login/",
        {
          email: formData.email,
          password: formData.password,
          remember_me: formData.rememberMe,
        },
        { withCredentials: true }
      );

      const { email, role } = response.data;

      // ✅ Save user session
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          role,
          isAuthenticated: true,
          rememberMe: formData.rememberMe,
        })
      );

      // ✅ Update App.js state
      setIsAuthenticated(true);
      setUserRole(role);

      // ✅ Navigate
      navigate(role === "maker" ? "/maker-dashboard" : "/dashboard");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: "An error occurred. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <nav className="bg-white/20 backdrop-blur-md shadow-md fixed w-full z-50 h-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Clickable logo + name using navigate */}
            <div
              className="flex items-center flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={machmateLogo}
                alt="MachMate Logo"
                className="h-8 w-8 mr-2 object-contain"
              />
              <span className="text-lg font-bold text-blue-600">MachMate</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-blue-100 mt-2">
              Sign in to your <span className="font-semibold">MachMate</span>{" "}
              account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="mb-4 bg-red-500/20 border border-red-400 text-red-200 px-4 py-2 rounded">
                {errors.submit}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? "border-2 border-red-500" : "border"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-red-300 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-2 border-red-500" : "border"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-red-300 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 text-white">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-200">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-300 hover:text-blue-500 font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
