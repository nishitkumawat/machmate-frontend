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
    acceptTerms: false,
    referralCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationModal, setVerificationModal] = useState(null); // 'email' or 'phone'
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState({
    email: false,
    phone: true,
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
    const { name, value, type, checked } = e.target;
    setErrors({});
    // Reset verification if user edits email or phone after verification
    if (name === "email" && isVerified.email) {
      setIsVerified((prev) => ({ ...prev, email: false }));
    }
    if (name === "phone" && isVerified.phone) {
      setIsVerified((prev) => ({ ...prev, phone: false }));
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

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

    if (!formData.acceptTerms)
      newErrors.acceptTerms =
        "You must accept the Terms and Conditions and Privacy Policy";

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
          error.response?.data?.message ||
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
          error.response?.data?.message ||
          "Failed to verify OTP. Please try again.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isVerified.email) {
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
        referralCode: formData.referralCode || null,
      });


      setSuccessMessage("Account created successfully! You can now login.");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        accountType: "buyer",
        acceptTerms: false,
        referralCode: "",
      });
      setIsVerified({ email: false });
      setOtpSent({ email: false });
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md shadow-lg fixed w-full z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div
              className="flex items-center flex-shrink-0 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <img
                src={machmateLogo}
                alt="MachMate Logo"
                className="h-10 w-10 mr-3 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-xl font-bold text-white drop-shadow-lg">
                MachMate
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen flex">
        {/* Left Side - Information (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md text-white backdrop-blur-sm bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Join MachMate Today
            </h1>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <p className="text-blue-100 text-lg">
                  Connect with manufacturers and suppliers worldwide
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <p className="text-blue-100 text-lg">
                  Streamline your manufacturing workflow
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <p className="text-blue-100 text-lg">
                  Real-time analytics and tracking
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-blue-200 italic">
                "MachMate helped us grow our manufacturing business by 60% in
                just 6 months!"
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-10 transition-all duration-300 hover:shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-800 mb-2">
                Create Your Account
              </h2>
              <p className="text-blue-600">
                Join MachMate and transform your manufacturing journey
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="mb-4 bg-red-500/20 border border-red-400/50 text-red-700 px-4 py-3 rounded-xl">
                  {errors.submit}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 bg-green-500/20 border border-green-400/50 text-green-700 px-4 py-3 rounded-xl">
                  {successMessage}
                </div>
              )}

              {/* Account Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-blue-800 mb-3">
                  I am a:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-blue-800 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="accountType"
                        value="buyer"
                        checked={formData.accountType === "buyer"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded-full border-blue-500 transition-all duration-300 group-hover:border-blue-700 ${
                          formData.accountType === "buyer"
                            ? "bg-blue-500 border-blue-500"
                            : ""
                        }`}
                      >
                        {formData.accountType === "buyer" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-blue-800">Work Seeker</span>
                  </label>
                  <label className="flex items-center text-blue-800 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="accountType"
                        value="maker"
                        checked={formData.accountType === "maker"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded-full border-blue-500 transition-all duration-300 group-hover:border-blue-700 ${
                          formData.accountType === "maker"
                            ? "bg-blue-500 border-blue-500"
                            : ""
                        }`}
                      >
                        {formData.accountType === "maker" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-blue-800">Machine Owner</span>
                  </label>
                </div>
              </div>

              {/* Username */}
              <div className="mb-6 group">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
                {errors.username && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.username}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-6 group">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Email Address
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                      placeholder="Enter your email"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => sendOtp("email")}
                    disabled={!formData.email || isVerified.email}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 border-2 ${
                      isVerified.email
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isVerified.email ? "Verified" : "Verify"}
                  </button>
                </div>
                {errors.email && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-6 group">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                    placeholder="Enter your 10-digit phone number"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
                {errors.phone && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-6 group">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                    placeholder="Enter your password"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
                {errors.password && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-6 group">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                    placeholder="Confirm your password"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
              {/* Referral Code (Optional) */}
              <div className="mb-6 group">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="Enter referral code"
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded border-blue-500 transition-all duration-300 group-hover:border-blue-700 ${
                        formData.acceptTerms
                          ? "bg-blue-500 border-blue-500"
                          : ""
                      }`}
                    >
                      {formData.acceptTerms && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-blue-800 text-sm transition-colors duration-300 group-hover:text-blue-600">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.acceptTerms}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isVerified.email}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-blue-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-800 hover:text-blue-600 font-medium underline decoration-transparent hover:decoration-blue-600 transition-all duration-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {verificationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-800">
                Verify {verificationModal === "email" ? "Email" : "Phone"}
              </h3>
              <button
                onClick={() => {
                  setVerificationModal(null);
                  setOtp("");
                  setErrors({});
                }}
                className="p-2 rounded-full hover:bg-blue-50 transition-colors duration-300 text-blue-600"
              >
                ✕
              </button>
            </div>

            <p className="text-blue-600 mb-4">
              {verificationModal === "email"
                ? `Enter the 6-digit code sent to ${formData.email}`
                : `Enter the code 123456 for demo (would be sent to ${formData.phone})`}
            </p>

            <div className="mb-4 group">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 text-center text-xl tracking-widest"
                maxLength="6"
              />
              {errors.otp && (
                <p className="mt-2 text-red-600 text-sm text-center">
                  {errors.otp}
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setVerificationModal(null);
                  setOtp("");
                  setErrors({});
                }}
                className="flex-1 bg-gray-100 text-blue-800 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Verify
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => sendOtp(verificationModal)}
                disabled={resendTimer[verificationModal] > 0}
                className={`text-blue-600 hover:text-blue-800 transition-colors duration-300 ${
                  resendTimer[verificationModal] > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:underline"
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
    </div>
  );
};

export default Signup;
