import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BuyerDashboard({ setIsAuthenticated, setUserRole }) {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    minPrice: 0,
    maxPrice: 10000,
    estimatedDate: "",
    address: "",
    country: "",
    state: "",
    city: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setProjectData((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const handleSubmitProject = (e) => {
    e.preventDefault();
    // Handle project submission logic here
    console.log("Project submitted:", projectData);
    setShowProjectForm(false);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/auth/logout/",
        {},
        { withCredentials: true }
      );
      console.log("Logout response:", res.data);
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
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
              <a
                href="#dashboard"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                Dashboard
              </a>
              <a
                href="#projects"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                My Projects
              </a>
              <a
                href="#orders"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                Previous Orders
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setShowSwitchDialog(true)}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
              >
                Switch to Maker
              </button>
              <button className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800">
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Logout
              </button>
            </div>

            <div className="md:hidden flex items-center">
              {/* Mobile menu button would go here */}
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Buyer Dashboard
          </h1>
          <button
            onClick={() => setShowProjectForm(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
          >
            + New Project
          </button>
        </div>

        {/* Project List/Status Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sample project cards */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
              <h3 className="font-medium text-gray-900 mb-2">
                CNC Machine Project
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Status: Quotes Received
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">$5,000 - $8,000</span>
                <span className="text-gray-500">Due: 15 Dec 2023</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
              <h3 className="font-medium text-gray-900 mb-2">
                3D Printer Assembly
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Status: In Production
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">$3,000 - $4,500</span>
                <span className="text-gray-500">Due: 22 Nov 2023</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
              <h3 className="font-medium text-gray-900 mb-2">
                Custom Fabrication
              </h3>
              <p className="text-sm text-gray-600 mb-3">Status: Completed</p>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">$7,200</span>
                <span className="text-gray-500">Delivered: 5 Oct 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Orders Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Previous Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Industrial Mixer
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    Precision Machines Inc.
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    $12,500
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    15 Aug 2023
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Conveyor System
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    Factory Solutions Ltd.
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    $8,700
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    22 Jul 2023
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Project
                </h2>
                <button
                  onClick={() => setShowProjectForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

              <form onSubmit={handleSubmitProject}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="name"
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={projectData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={projectData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Budget Range
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">
                      ${projectData.minPrice}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={projectData.minPrice}
                      onChange={(e) =>
                        handlePriceRangeChange(
                          parseInt(e.target.value),
                          projectData.maxPrice
                        )
                      }
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">
                      ${projectData.maxPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$0</span>
                    <span>$50,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="estimatedDate"
                  >
                    Estimated Completion Date
                  </label>
                  <input
                    type="date"
                    id="estimatedDate"
                    name="estimatedDate"
                    value={projectData.estimatedDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="address"
                  >
                    Full Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={projectData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="country"
                    >
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={projectData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="usa">United States</option>
                      <option value="canada">Canada</option>
                      <option value="uk">United Kingdom</option>
                      <option value="germany">Germany</option>
                      <option value="japan">Japan</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="state"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={projectData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select State</option>
                      <option value="ca">California</option>
                      <option value="tx">Texas</option>
                      <option value="ny">New York</option>
                      <option value="fl">Florida</option>
                      <option value="il">Illinois</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="city"
                    >
                      City
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={projectData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select City</option>
                      <option value="losangeles">Los Angeles</option>
                      <option value="houston">Houston</option>
                      <option value="newyork">New York</option>
                      <option value="miami">Miami</option>
                      <option value="chicago">Chicago</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Switch to Maker Dialog */}
      {showSwitchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Switch to Maker Account
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to switch to a maker account? This will log
              you out of your buyer account and redirect you to the maker
              registration page.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSwitchDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle switch to maker logic
                  console.log("Switching to maker account");
                  setShowSwitchDialog(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
