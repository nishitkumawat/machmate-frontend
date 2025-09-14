import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    accountType: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await axios.post(API_HOST+"/auth/register/", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        accountType: formData.accountType,
      });

      setSuccessMessage("Account created successfully! You can now login.");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        accountType: "buyer",
      });
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.error || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Signup Card */}
      <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
          <p className="text-blue-100 mt-2">
            Join <span className="font-semibold">MachMate</span> today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="mb-4 bg-red-500/20 border border-red-400 text-red-200 px-4 py-2 rounded">
              {errors.submit}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 bg-green-500/20 border border-green-400 text-green-200 px-4 py-2 rounded">
              {successMessage}
            </div>
          )}

          {/* Account Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              I am a:
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center text-white">
                <input
                  type="radio"
                  name="accountType"
                  value="buyer"
                  checked={formData.accountType === "buyer"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-400"
                />
                <span className="ml-2">Buyer</span>
              </label>
              <label className="flex items-center text-white">
                <input
                  type="radio"
                  name="accountType"
                  value="maker"
                  checked={formData.accountType === "maker"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-400"
                />
                <span className="ml-2">Machine Maker</span>
              </label>
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.username ? "border-2 border-red-500" : "border"
              }`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="mt-1 text-red-300 text-sm">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.email ? "border-2 border-red-500" : "border"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-red-300 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.phone ? "border-2 border-red-500" : "border"
              }`}
              placeholder="Enter your 10-digit phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-red-300 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.password ? "border-2 border-red-500" : "border"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-red-300 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.confirmPassword ? "border-2 border-red-500" : "border"
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-red-300 text-sm">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-200">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-300 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
