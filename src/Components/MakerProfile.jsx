import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import statesAndCitiesJSON from "../assets/states_and_districts.json";

function MakerProfile({ setIsAuthenticated, setUserRole }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [companyData, setCompanyData] = useState({
    company_name: "",
    year_established: "",
    company_description: "",
    specializations: [],
    address: "",
    state: "",
    city: "",
    website: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCompanyEditing, setIsCompanyEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);

  const specializationsList = [
    "CNC Machining",
    "3D Printing",
    "Metal Fabrication",
    "Plastic Molding",
    "Electronics",
    "Assembly",
    "Prototyping",
    "Custom Machinery",
  ];

  const statesAndCities = statesAndCitiesJSON;
  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchCompanyData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/auth/profile/", {
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
        setIsAuthenticated(false);
        navigate("/login");
      } else {
        setMessage({ type: "error", text: "Failed to load profile data" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/maker/company-details/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      console.log("API Response:", response.data);

      if (response.data && !response.data.error) {
        const updatedData = {
          company_name: response.data.company_name || "",
          year_established: response.data.year_established || "",
          company_description: response.data.company_description || "",
          specializations: response.data.specializations || [],
          address: response.data.address || "",
          state: response.data.state || "",
          city: response.data.city || "",
          website: response.data.website || "",
        };

        setCompanyData(updatedData);
        setHasCompanyProfile(true);

        console.log("Updated company data:", updatedData);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasCompanyProfile(false);
      } else {
        console.error("Failed to fetch company data", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "state") {
      setCompanyData((prev) => ({
        ...prev,
        state: value,
        city: "", // reset city when state changes
      }));
    } else {
      setCompanyData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    setCompanyData((prev) => {
      let updatedSpecs = [...prev.specializations];
      if (checked) {
        updatedSpecs.push(value);
      } else {
        updatedSpecs = updatedSpecs.filter((spec) => spec !== value);
      }
      return { ...prev, specializations: updatedSpecs };
    });
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

      if (userData.newPassword) {
        payload.currentPassword = userData.currentPassword;
        payload.newPassword = userData.newPassword;
        payload.confirmPassword = userData.confirmPassword;
      }

      const response = await axios.put(
        "http://localhost:8000/auth/profile/update/",
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

      setUserData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

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

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const endpoint = hasCompanyProfile
        ? "http://localhost:8000/maker/company-details/update/"
        : "http://localhost:8000/maker/company-details/create/";

      const method = hasCompanyProfile ? "put" : "post";

      // const endpoint = "http://localhost:8000/maker/company-details/create/";
      // const method = "post";

      await axios[method](
        endpoint,
        {
          company_name: companyData.company_name,
          year_established: companyData.year_established,
          company_description: companyData.company_description,
          specializations: companyData.specializations,
          address: companyData.address,
          state: companyData.state,
          city: companyData.city,
          website: companyData.website,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );

      setMessage({
        type: "success",
        text: "Company profile saved successfully!",
      });
      setIsCompanyEditing(false);
      setHasCompanyProfile(true);
    } catch (error) {
      console.error("Failed to save company profile", error);
      if (error.response?.data?.error) {
        setMessage({ type: "error", text: error.response.data.error });
      } else {
        setMessage({ type: "error", text: "Failed to save company profile" });
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
        "http://localhost:8000/auth/profile/change-password/",
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
    fetchUserData();
    setMessage({ type: "", text: "" });

    setUserData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleCancelCompanyEdit = () => {
    setIsCompanyEditing(false);
    fetchCompanyData();
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/auth/logout/",
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
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">MachMate</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/maker-dashboard")}
                className="px-3 py-2 font-medium text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </button>
              <button className="px-3 py-2 font-medium text-blue-600">
                Profile
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <button
              onClick={() => navigate("/maker-dashboard")}
              className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Dashboard
            </button>
            <button className="block px-4 py-2 text-blue-600 hover:bg-blue-50">
              Profile
            </button>
          </div>
        )}
      </nav>
      {/* Profile Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold">
                  {userData.name || "User"}
                </h1>
                <p className="text-blue-100">{userData.email}</p>
                {hasCompanyProfile && (
                  <p className="text-blue-100 mt-1">
                    {companyData.company_name}
                  </p>
                )}
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
                onClick={() => setActiveTab("company")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "company"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Company Details
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
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={userData.email}
                        disabled={true}
                        className="mt-极速block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:极速gray-100"
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
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text极速m font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === "company" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Company Details
                  </h2>
                  {hasCompanyProfile && !isCompanyEditing && (
                    <button
                      type="button"
                      onClick={() => setIsCompanyEditing(true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCompanyProfile}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        htmlFor="company_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        id="company_name"
                        value={companyData.company_name}
                        onChange={handleCompanyInputChange}
                        disabled={!isCompanyEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="year_established"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Year Established
                        </label>
                        <input
                          type="number"
                          name="year_established"
                          id="year_established"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={companyData.year_established}
                          onChange={handleCompanyInputChange}
                          disabled={!isCompanyEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="website"
                          className="block text-sm font-medium text-gray-极速"
                        >
                          Website (optional)
                        </label>
                        <input
                          type="url"
                          name="website"
                          id="website"
                          value={companyData.website}
                          onChange={handleCompanyInputChange}
                          disabled={!isCompanyEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="company_description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Company Description
                      </label>
                      <textarea
                        name="company_description"
                        id="company_description"
                        rows={4}
                        value={companyData.company_description}
                        onChange={handleCompanyInputChange}
                        disabled={!isCompanyEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {specializationsList.map((spec) => (
                          <label
                            key={spec}
                            className="flex items-center text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                              value={spec}
                              checked={companyData.specializations.includes(
                                spec
                              )}
                              onChange={handleSpecializationChange}
                              disabled={!isCompanyEditing}
                            />
                            <span className="ml-2">{spec}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Business Address
                      </label>
                      <textarea
                        name="address"
                        id="address"
                        rows={3}
                        value={companyData.address}
                        onChange={handleCompanyInputChange}
                        disabled={!isCompanyEditing}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700"
                        >
                          State
                        </label>
                        <select
                          name="state"
                          id="state"
                          value={companyData.state}
                          onChange={handleCompanyInputChange}
                          disabled={!isCompanyEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                          required
                        >
                          <option value="">Select State</option>
                          {Object.keys(statesAndCities).map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700"
                        >
                          City
                        </label>
                        <select
                          name="city"
                          id="city"
                          value={companyData.city}
                          onChange={handleCompanyInputChange}
                          disabled={!isCompanyEditing || !companyData.state}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                          required
                        >
                          <option value="">Select City</option>
                          {companyData.state &&
                            statesAndCities[companyData.state].map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {isCompanyEditing && (
                    <div className="mt-8 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelCompanyEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:极速blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                      >
                        {isLoading ? "Saving..." : "Save Company Details"}
                      </button>
                    </div>
                  )}
                </form>

                {!hasCompanyProfile && !isCompanyEditing && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      You haven't set up your company profile yet. Please add
                      your company details to get started.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCompanyEditing(true)}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Add Company Details
                    </button>
                  </div>
                )}
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

export default MakerProfile;
