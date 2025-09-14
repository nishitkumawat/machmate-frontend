import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const API_HOST = import.meta.env.VITE_API_HOST;

function BuyerProfile({ setIsAuthenticated, setUserRole }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_HOST+"/auth/profile/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      setUserData((prev) => ({
        ...prev,
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
      }));
    } catch (error) {
      console.error("Failed to fetch user data", error);
      if (error.response?.status === 401) {
        // User is not authenticated, redirect to login
        setIsAuthenticated(false);
        navigate("/login");
      } else {
        setMessage({ type: "error", text: "Failed to load profile data" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (
      userData.newPassword &&
      userData.newPassword !== userData.confirmPassword
    ) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        name: userData.name,
        phone: userData.phone,
      };

      // Only include password fields if a new password is provided
      if (userData.newPassword) {
        payload.currentPassword = userData.currentPassword;
        payload.newPassword = userData.newPassword;
        payload.confirmPassword = userData.confirmPassword;
      }

      const response = await axios.put(
        API_HOST+"/auth/profile/update/",
        payload,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);

      // Clear password fields after successful update
      setUserData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Refresh user data to get any server-side changes
      fetchUserData();
    } catch (error) {
      console.error("Failed to update profile", error);
      if (error.response?.data?.error) {
        setMessage({ type: "error", text: error.response.data.error });
      } else {
        setMessage({ type: "error", text: "Failed to update profile" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (userData.newPassword !== userData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        currentPassword: userData.currentPassword,
        newPassword: userData.newPassword,
        confirmPassword: userData.confirmPassword,
      };

      const response = await axios.post(
        API_HOST+"/auth/profile/change-password/",
        payload,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({ type: "success", text: "Password changed successfully!" });

      // Clear password fields after successful update
      setUserData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Failed to change password", error);
      if (error.response?.data?.error) {
        setMessage({ type: "error", text: error.response.data.error });
      } else {
        setMessage({ type: "error", text: "Failed to change password" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    fetchUserData(); // Reset form with original data
    setMessage({ type: "", text: "" });

    // Clear password fields
    setUserData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        API_HOST+"/auth/logout/",
        {},
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
    } catch (err) {
      console.error("Logout failed", err);
    }

    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Navigation - Same as BuyerDashboard */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-blue-600 h-8 w-8 rounded-md flex items-center justify-center mr-2">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2极速4-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.极速 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  MachMate
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 py-2 font-medium text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </button>
              <button className="px-3 py-2 font-medium text-blue-600">
                Profile
              </button>
            </div>

            <div className="hidden md:极速 items-center space-x-2">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6极速8 text-white">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold">
                  {userData.name || "User"}
                </h1>
                <p className="text-blue-100">{userData.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("personal")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "personal"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`mx-6 mt-6 p-4 rounded-md ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "personal" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Personal Information
                </h2>

                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text极速ray-700"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={userData.email}
                        disabled={true}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Change Password
                </h2>

                <form onSubmit={handleChangePassword}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={userData.currentPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={userData.newPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={userData.confirmPassword}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerProfile;
