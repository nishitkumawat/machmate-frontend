import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Smartphone,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import machmateLogo from "../assets/logo-dark.png";

const API_HOST = import.meta.env.VITE_API_HOST;

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    method: "email",
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    step: 1,
  });
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData({ ...forgotPasswordData, [name]: value });
    if (forgotPasswordErrors[name])
      setForgotPasswordErrors({ ...forgotPasswordErrors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordStep1 = () => {
    const newErrors = {};
    if (forgotPasswordData.method === "email") {
      if (!forgotPasswordData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(forgotPasswordData.email)) {
        newErrors.email = "Email is invalid";
      }
    } else {
      if (!forgotPasswordData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(forgotPasswordData.phone)) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }
    setForgotPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordStep2 = () => {
    const newErrors = {};
    if (!forgotPasswordData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(forgotPasswordData.otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }
    setForgotPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordStep3 = () => {
    const newErrors = {};
    if (!forgotPasswordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (forgotPasswordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(forgotPasswordData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter";
    } else if (!/[@$!%*?&]/.test(forgotPasswordData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one special character (@$!%*?&)";
    }
    if (!forgotPasswordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (
      forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setForgotPasswordErrors(newErrors);
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

      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          role,
          isAuthenticated: true,
          rememberMe: formData.rememberMe,
        })
      );
      setIsAuthenticated(true);
      setUserRole(role);
      navigate(role === "maker" ? "/maker-dashboard" : "/dashboard");
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

  const handleSendOtp = async () => {
    if (!validateForgotPasswordStep1()) return;
    setIsSendingOtp(true);
    try {
      const endpoint =
        forgotPasswordData.method === "email"
          ? "/auth/forgot-send-email-otp/"
          : "/auth/forgot-send-phone-otp/";
      const data =
        forgotPasswordData.method === "email"
          ? { email: forgotPasswordData.email }
          : { phone: forgotPasswordData.phone };

      const response = await axios.post(API_HOST + endpoint, data);
      if (response.data.success) {
        setOtpSent(true);
        setForgotPasswordData({ ...forgotPasswordData, step: 2 });
        setForgotPasswordErrors({});
      } else {
        setForgotPasswordErrors({ submit: response.data.message });
      }
    } catch (error) {
      setForgotPasswordErrors({
        submit:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateForgotPasswordStep2()) return;
    setIsVerifyingOtp(true);
    try {
      const endpoint =
        forgotPasswordData.method === "email"
          ? "/auth/forgot-verify-email-otp/"
          : "/auth/forgot-verify-phone-otp/";
      const data =
        forgotPasswordData.method === "email"
          ? { email: forgotPasswordData.email, otp: forgotPasswordData.otp }
          : { phone: forgotPasswordData.phone, otp: forgotPasswordData.otp };

      const response = await axios.post(API_HOST + endpoint, data);
      if (response.data.success) {
        setForgotPasswordData({ ...forgotPasswordData, step: 3 });
        setForgotPasswordErrors({});
      } else {
        setForgotPasswordErrors({ submit: response.data.message });
      }
    } catch (error) {
      setForgotPasswordErrors({
        submit:
          error.response?.data?.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForgotPasswordStep3()) return;
    setIsResettingPassword(true);
    try {
      const response = await axios.post(API_HOST + "/auth/reset-password/", {
        email:
          forgotPasswordData.method === "email"
            ? forgotPasswordData.email
            : undefined,
        phone:
          forgotPasswordData.method === "phone"
            ? forgotPasswordData.phone
            : undefined,
        otp: forgotPasswordData.otp,
        new_password: forgotPasswordData.newPassword,
      });
      if (response.data.success) {
        setShowForgotPassword(false);
        setForgotPasswordData({
          method: "email",
          email: "",
          phone: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
          step: 1,
        });
        setForgotPasswordErrors({});
        alert(
          "✅ Password reset successful! Please login with your new password."
        );
      } else {
        setForgotPasswordErrors({ submit: response.data.message });
      }
    } catch (error) {
      setForgotPasswordErrors({
        submit:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setForgotPasswordData({
      method: "email",
      email: "",
      phone: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      step: 1,
    });
    setForgotPasswordErrors({});
    setOtpSent(false);
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
              Welcome to MachMate
            </h1>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                <p className="text-blue-100 text-lg">
                  Streamline your manufacturing processes with intelligent
                  solutions
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                <p className="text-blue-100 text-lg">
                  Connect with suppliers and manufacturers seamlessly
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                <p className="text-blue-100 text-lg">
                  Real-time tracking and analytics for your business
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-blue-200 italic">
                "MachMate transformed how we manage our manufacturing workflow.
                Efficiency increased by 40%!"
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          {/* Changed background to white and text to blue */}
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-10 transition-all duration-300 hover:shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-blue-600">
                Sign in to continue your journey with MachMate
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-red-500/20 border border-red-400/50 text-red-700 px-4 py-3 rounded-xl backdrop-blur-sm">
                  {errors.submit}
                </div>
              )}

              {/* Email Field */}
              <div className="group">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="h-5 w-5 text-blue-600 transition-colors duration-300 group-hover:text-blue-800" />
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-blue-800"
                  >
                    Email Address
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 focus:placeholder-transparent"
                    placeholder="Enter your email"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
                {errors.email && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex items-center space-x-3 mb-2">
                  <Lock className="h-5 w-5 text-blue-600 transition-colors duration-300 group-hover:text-blue-800" />
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-blue-800"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 pr-10 transition-all duration-300 focus:placeholder-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors duration-300 p-1 rounded-full hover:bg-blue-50"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></div>
                </div>
                {errors.password && (
                  <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded border-blue-500 transition-all duration-300 group-hover:border-blue-700 ${
                        formData.rememberMe ? "bg-blue-500 border-blue-500" : ""
                      }`}
                    >
                      {formData.rememberMe && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-blue-800 text-sm transition-colors duration-300 group-hover:text-blue-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300 underline decoration-transparent hover:decoration-blue-800"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-blue-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-800 hover:text-blue-600 font-medium underline decoration-transparent hover:decoration-blue-600 transition-all duration-300"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={resetForgotPasswordFlow}
                className="p-2 rounded-full hover:bg-blue-50 transition-colors duration-300 text-blue-800"
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-xl font-bold text-blue-800 text-center flex-1 mr-8">
                Reset Password
              </h3>
            </div>

            {forgotPasswordErrors.submit && (
              <div className="mb-4 bg-red-500/20 border border-red-400/50 text-red-700 px-4 py-3 rounded-xl">
                {forgotPasswordErrors.submit}
              </div>
            )}

            {forgotPasswordData.step === 1 && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-blue-800 mb-4">
                    How would you like to reset your password?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setForgotPasswordData({
                          ...forgotPasswordData,
                          method: "email",
                        })
                      }
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                        forgotPasswordData.method === "email"
                          ? "bg-blue-500/20 border-blue-400 text-blue-800 shadow-lg"
                          : "bg-gray-100 border-gray-300 text-blue-600 hover:border-blue-400"
                      }`}
                    >
                      <Mail className="h-5 w-5 mx-auto mb-1" />
                      Email
                    </button>
                    {/* <button
                      type="button"
                      onClick={() =>
                        setForgotPasswordData({
                          ...forgotPasswordData,
                          method: "phone",
                        })
                      }
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 ${
                        forgotPasswordData.method === "phone"
                          ? "bg-blue-500/20 border-blue-400 text-blue-800 shadow-lg"
                          : "bg-gray-100 border-gray-300 text-blue-600 hover:border-blue-400"
                      }`}
                    >
                      <Smartphone className="h-5 w-5 mx-auto mb-1" />
                      Phone
                    </button> */}
                  </div>
                </div>

                {forgotPasswordData.method === "email" ? (
                  <div className="mb-6 group">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-medium text-blue-800">
                        Email Address
                      </label>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                    {forgotPasswordErrors.email && (
                      <p className="mt-2 text-red-600 text-sm">
                        {forgotPasswordErrors.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 group">
                    <div className="flex items-center space-x-3 mb-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-medium text-blue-800">
                        Phone Number
                      </label>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={forgotPasswordData.phone}
                      onChange={handleForgotPasswordChange}
                      className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                    {forgotPasswordErrors.phone && (
                      <p className="mt-2 text-red-600 text-sm">
                        {forgotPasswordErrors.phone}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                >
                  {isSendingOtp ? "Sending..." : "Send Verification Code"}
                </button>
              </>
            )}

            {forgotPasswordData.step === 2 && (
              <>
                <div className="mb-6">
                  <p className="text-blue-600 mb-4 text-center">
                    We've sent a 6-digit verification code to your{" "}
                    {forgotPasswordData.method}
                  </p>
                  <div className="group">
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={forgotPasswordData.otp}
                      onChange={handleForgotPasswordChange}
                      className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300 text-center text-xl tracking-widest"
                      placeholder="XXXXXX"
                      maxLength="6"
                    />
                    {forgotPasswordErrors.otp && (
                      <p className="mt-2 text-red-600 text-sm">
                        {forgotPasswordErrors.otp}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      setForgotPasswordData({ ...forgotPasswordData, step: 1 })
                    }
                    className="flex-1 bg-gray-100 text-blue-800 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </>
            )}

            {forgotPasswordData.step === 3 && (
              <>
                <div className="mb-6">
                  <p className="text-blue-600 mb-4 text-center">
                    Create your new password
                  </p>

                  <div className="group mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-medium text-blue-800">
                        New Password
                      </label>
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
                      className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300"
                      placeholder="Enter new password"
                    />
                    {forgotPasswordErrors.newPassword && (
                      <p className="mt-2 text-red-600 text-sm">
                        {forgotPasswordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <div className="flex items-center space-x-3 mb-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-medium text-blue-800">
                        Confirm Password
                      </label>
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={forgotPasswordData.confirmPassword}
                      onChange={handleForgotPasswordChange}
                      className="w-full bg-transparent border-0 border-b-2 border-blue-400/50 text-blue-800 placeholder-blue-500/70 focus:border-blue-600 focus:ring-0 px-0 py-3 transition-all duration-300"
                      placeholder="Confirm new password"
                    />
                    {forgotPasswordErrors.confirmPassword && (
                      <p className="mt-2 text-red-600 text-sm">
                        {forgotPasswordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      setForgotPasswordData({ ...forgotPasswordData, step: 2 })
                    }
                    className="flex-1 bg-gray-100 text-blue-800 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isResettingPassword ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
