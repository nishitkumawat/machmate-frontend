import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import machmateLogo from "../assets/logo-dark.png";

const API_HOST = import.meta.env.VITE_API_HOST;

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // ✅ Login form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Forgot password step validations
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

  // ✅ Handle login
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
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Send OTP
  const handleSendOtp = async () => {
    if (!validateForgotPasswordStep1()) return;
    setIsSendingOtp(true);
    try {
      const endpoint =
        forgotPasswordData.method === "email"
          ? "/auth/send-email-otp/"
          : "/auth/send-phone-otp/";
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

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (!validateForgotPasswordStep2()) return;
    setIsVerifyingOtp(true);
    try {
      const endpoint =
        forgotPasswordData.method === "email"
          ? "/auth/verify-email-otp/"
          : "/auth/verify-phone-otp/";
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

  // ✅ Reset password
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

            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-2 border-red-500" : "border"
                }`}
                placeholder="Enter your password"
              />

              {/* 👁️ Toggle Button with Lucide */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {errors.password && (
                <p className="mt-1 text-red-300 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Remember me and Forgot Password */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
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

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-300 hover:text-blue-500 text-sm font-medium"
              >
                Forgot Password?
              </button>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Reset Password
              </h3>
              <button
                onClick={resetForgotPasswordFlow}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {forgotPasswordErrors.submit && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {forgotPasswordErrors.submit}
              </div>
            )}

            {forgotPasswordData.step === 1 && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`flex-1 py-2 px-4 rounded-lg border ${
                        forgotPasswordData.method === "email"
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForgotPasswordData({
                          ...forgotPasswordData,
                          method: "phone",
                        })
                      }
                      className={`flex-1 py-2 px-4 rounded-lg border ${
                        forgotPasswordData.method === "phone"
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      Phone
                    </button>
                  </div>
                </div>

                {forgotPasswordData.method === "email" ? (
                  <div className="mb-4">
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      name="email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        forgotPasswordErrors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Enter your email address"
                    />
                    {forgotPasswordErrors.email && (
                      <p className="mt-1 text-red-500 text-sm">
                        {forgotPasswordErrors.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <label
                      htmlFor="forgot-phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="forgot-phone"
                      name="phone"
                      value={forgotPasswordData.phone}
                      onChange={handleForgotPasswordChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        forgotPasswordErrors.phone
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Enter your phone number"
                    />
                    {forgotPasswordErrors.phone && (
                      <p className="mt-1 text-red-500 text-sm">
                        {forgotPasswordErrors.phone}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 disabled:opacity-50"
                >
                  {isSendingOtp ? "Sending..." : "Send Verification Code"}
                </button>
              </>
            )}

            {forgotPasswordData.step === 2 && (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    We've sent a 6-digit verification code to your{" "}
                    {forgotPasswordData.method}. Please enter it below.
                  </p>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={forgotPasswordData.otp}
                    onChange={handleForgotPasswordChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      forgotPasswordErrors.otp
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                  />
                  {forgotPasswordErrors.otp && (
                    <p className="mt-1 text-red-500 text-sm">
                      {forgotPasswordErrors.otp}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      setForgotPasswordData({ ...forgotPasswordData, step: 1 })
                    }
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </>
            )}

            {forgotPasswordData.step === 3 && (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    Please enter your new password below.
                  </p>

                  <div className="mb-4">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        forgotPasswordErrors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Enter new password"
                    />
                    {forgotPasswordErrors.newPassword && (
                      <p className="mt-1 text-red-500 text-sm">
                        {forgotPasswordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={forgotPasswordData.confirmPassword}
                      onChange={handleForgotPasswordChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        forgotPasswordErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      placeholder="Confirm new password"
                    />
                    {forgotPasswordErrors.confirmPassword && (
                      <p className="mt-1 text-red-500 text-sm">
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 disabled:opacity-50"
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
