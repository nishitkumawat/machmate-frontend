import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import machmateLogo from "../assets/logo-dark.png";

const API_HOST = import.meta.env.VITE_API_HOST;

const Signup = () => {
  const navigate = useNavigate();
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
  const [verificationModal, setVerificationModal] = useState(null); // 'email' or 'phone'
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState({
    email: false,
    phone: false,
  });
  const [otpSent, setOtpSent] = useState({
    email: false,
    phone: false,
  });

  // Timer state
  const [resendTimer, setResendTimer] = useState({
    email: 0,
    phone: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => ({
        email: prev.email > 0 ? prev.email - 1 : 0,
        phone: prev.phone > 0 ? prev.phone - 1 : 0,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset verification if user edits email or phone after verification
    if (name === "email" && isVerified.email) {
      setIsVerified((prev) => ({ ...prev, email: false }));
    }
    if (name === "phone" && isVerified.phone) {
      setIsVerified((prev) => ({ ...prev, phone: false }));
    }

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

  const sendOtp = async (type) => {
    try {
      if (type === "email") {
        await axios.post(API_HOST + "/auth/send-email-otp/", {
          email: formData.email,
        });
        setOtpSent({ ...otpSent, email: true });
        setVerificationModal("email");
        setResendTimer((prev) => ({ ...prev, email: 30 })); // 30 sec cooldown
      }

      if (type === "phone") {
        await axios.post(API_HOST + "/auth/send-phone-otp/", {
          phone: formData.phone,
        });
        setOtpSent({ ...otpSent, phone: true });
        setVerificationModal("phone");
        setResendTimer((prev) => ({ ...prev, phone: 30 })); // 30 sec cooldown
      }
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.error ||
          "Failed to send OTP. Please try again.",
      });
    }
  };

  const verifyOtp = async () => {
    try {
      if (verificationModal === "email") {
        const res = await axios.post(API_HOST + "/auth/verify-email-otp/", {
          email: formData.email,
          otp,
        });
        if (res.data.success) {
          setIsVerified({ ...isVerified, email: true });
          setVerificationModal(null);
          setOtp("");
        } else {
          setErrors({ otp: "Invalid email OTP. Please try again." });
        }
      }

      if (verificationModal === "phone") {
        const res = await axios.post(API_HOST + "/auth/verify-phone-otp/", {
          phone: formData.phone,
          otp,
        });
        if (res.data.success) {
          setIsVerified({ ...isVerified, phone: true });
          setVerificationModal(null);
          setOtp("");
        } else {
          setErrors({ otp: "Invalid phone OTP. Please try again." });
        }
      }
    } catch (error) {
      setErrors({
        otp:
          error.response?.data?.error ||
          "Failed to verify OTP. Please try again.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isVerified.email || !isVerified.phone) {
      setErrors({
        submit:
          "Please verify both your email and phone number before signing up.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(API_HOST + "/auth/register/", {
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
      setIsVerified({ email: false, phone: false });
      setOtpSent({ email: false, phone: false });
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
    <div>
      <nav className="bg-white/20 backdrop-blur-md shadow-md fixed w-full z-50 h-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
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
      <div className="relative min-h-screen flex flex-col justify-center items-center py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* OTP Modal */}
        {verificationModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-semibold mb-4">
                Verify {verificationModal === "email" ? "Email" : "Phone"}
              </h3>
              <p className="mb-4">
                {verificationModal === "email"
                  ? `Enter the 6-digit code sent to ${formData.email}`
                  : `Enter the code 123456 for demo (would be sent to ${formData.phone})`}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mb-4">{errors.otp}</p>
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setVerificationModal(null);
                    setOtp("");
                    setErrors({});
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyOtp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Verify
                </button>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => sendOtp(verificationModal)}
                  disabled={resendTimer[verificationModal] > 0}
                  className={`${
                    resendTimer[verificationModal] > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:underline"
                  }`}
                >
                  {resendTimer[verificationModal] > 0
                    ? `Resend in ${resendTimer[verificationModal]}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signup Card */}
        <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-10 border border-white/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              Create Your Account
            </h2>
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
              <div className="flex">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`flex-grow px-4 py-2 rounded-l-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.email ? "border-2 border-red-500" : "border"
                  }`}
                  placeholder="Enter your email"
                />
                <button
                  type="button"
                  onClick={() => sendOtp("email")}
                  disabled={!formData.email || isVerified.email}
                  className={`px-4 py-2 rounded-r-lg ${
                    isVerified.email
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-50`}
                >
                  {isVerified.email ? "Verified" : "Verify"}
                </button>
              </div>
              {errors.email && (
                <p className="mt-1 text-red-300 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Phone Number
              </label>
              <div className="flex">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`flex-grow px-4 py-2 rounded-l-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.phone ? "border-2 border-red-500" : "border"
                  }`}
                  placeholder="Enter your 10-digit phone number"
                />
                <button
                  type="button"
                  onClick={() => sendOtp("phone")}
                  disabled={!formData.phone || isVerified.phone}
                  className={`px-4 py-2 rounded-r-lg ${
                    isVerified.phone
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-50`}
                >
                  {isVerified.phone ? "Verified" : "Verify"}
                </button>
              </div>
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !isVerified.email || !isVerified.phone}
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
    </div>
  );
};

export default Signup;
