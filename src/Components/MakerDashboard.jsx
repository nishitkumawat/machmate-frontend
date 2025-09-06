import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

function MakerDashboard({ setIsAuthenticated, setUserRole }) {
  const [showCompanyForm, setShowCompanyForm] = useState(true); // Show form for first-time users
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [quotationData, setQuotationData] = useState({
    amount: "",
    percentageChange: 0,
    completionDate: "",
  });
  const [filters, setFilters] = useState({
    price: "",
    date: "",
    location: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [openProjects, setOpenProjects] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  // Add this near the top of your component, after the state declarations
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

  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();

  // Fetch open projects on component mount
  useEffect(() => {
    axios.get("http://localhost:8000/csrf/", { withCredentials: true });
    fetchOpenProjects();

    // Set up scroll spy
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let currentSection = "dashboard";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 100) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchOpenProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/maker/projects/open/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      setOpenProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch open projects", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuotationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:8000/maker/projects/${selectedProject.id}/quotation/`,
        quotationData,
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      setShowQuotationDialog(false);
      alert("Quotation submitted successfully!");
    } catch (error) {
      console.error("Failed to submit quotation", error);
      alert("Failed to submit quotation. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      const csrftoken = Cookies.get("csrftoken");
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

  const [companyData, setCompanyData] = useState({
    companyName: "",
    yearEstablished: "",
    companyDescription: "",
    specializations: [],
    address: "",
    country: "",
    state: "",
    city: "",
    website: "",
  });

  // For checkboxes (specializations)
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

  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/maker/company-details/",
        {
          company_name: companyData.companyName,
          year_established: companyData.yearEstablished,
          company_description: companyData.companyDescription,
          specializations: companyData.specializations,
          address: companyData.address,
          country: companyData.country,
          state: companyData.state,
          city: companyData.city,
          website: companyData.website,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      setShowCompanyForm(false);
      alert("Company profile saved successfully!");
    } catch (error) {
      console.error("Failed to save company profile", error);
      alert("Failed to save profile. Please try again.");
    }
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
                className={`px-3 py-2 font-medium ${
                  activeSection === "dashboard"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Dashboard
              </a>
              <a
                href="#quotations"
                className={`px-3 py-2 font-medium ${
                  activeSection === "quotations"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                My Quotations
              </a>
              <a
                href="#projects"
                className={`px-3 py-2 font-medium ${
                  activeSection === "projects"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Active Projects
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-2">
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

      {/* Company Details Form for First-Time Users */}
      {showCompanyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Your Company Profile
              </h2>
              <form onSubmit={handleCompanySubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleCompanyInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="yearEstablished"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      Year Established
                    </label>
                    <input
                      type="number"
                      id="yearEstablished"
                      name="yearEstablished"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={companyData.yearEstablished}
                      onChange={handleCompanyInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="companyDescription"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Company Description
                  </label>
                  <textarea
                    id="companyDescription"
                    name="companyDescription"
                    rows={3}
                    value={companyData.companyDescription}
                    onChange={handleCompanyInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Specializations
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {specializationsList.map((spec) => (
                      <label key={spec} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          value={spec}
                          checked={companyData.specializations.includes(spec)}
                          onChange={handleSpecializationChange}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {spec}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Business Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={companyData.address}
                    onChange={handleCompanyInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={companyData.country}
                      onChange={handleCompanyInputChange}
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
                      htmlFor="state"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={companyData.state}
                      onChange={handleCompanyInputChange}
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
                      htmlFor="city"
                      className="block text-gray-700 text-sm font-medium mb-2"
                    >
                      City
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={companyData.city}
                      onChange={handleCompanyInputChange}
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

                <div className="mb-4">
                  <label
                    htmlFor="website"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={companyData.website}
                    onChange={handleCompanyInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <section id="dashboard" className="mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Maker Dashboard
          </h1>
        </section>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <select
                name="price"
                value={filters.price}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Price</option>
                <option value="low">Low to High</option>
                <option value="high">High to Low</option>
              </select>

              <select
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Date</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Location</option>
                <option value="local">Local First</option>
                <option value="any">Any Location</option>
              </select>
            </div>
          </div>
        </div>

        {/* Open Projects List */}
        <section id="projects">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-sem极速 text-gray-900 mb-4">
              Open Projects
            </h2>

            {openProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No open projects found matching your criteria.
              </p>
            ) : (
              <div className="space-y-4">
                {openProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {project.minPrice} - {project.maxPrice}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Due:{" "}
                            {new Date(
                              project.estimatedDate
                            ).toLocaleDateString()}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {project.city}, {project.state}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowQuotationDialog(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-300 whitespace-nowrap"
                      >
                        Create Quotation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quotation Dialog */}
      {showQuotationDialog && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Create Quotation
                </h2>
                <button
                  onClick={() => setShowQuotationDialog(false)}
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

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">
                  {selectedProject.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedProject.description}
                </p>
              </div>

              <form onSubmit={handleSubmitQuotation}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="amount"
                  >
                    Quotation Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={quotationData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Percentage Change (%)
                  </label>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {quotationData.percentageChange > 0 ? "+" : ""}
                      {quotationData.percentageChange}%
                    </span>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      value={quotationData.percentageChange}
                      onChange={(e) =>
                        setQuotationData((prev) => ({
                          ...prev,
                          percentageChange: parseInt(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-10%</span>
                    <span>0%</span>
                    <span>+10%</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="completionDate"
                  >
                    Estimated Completion Date
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    name="completionDate"
                    value={quotationData.completionDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowQuotationDialog(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Submit Quotation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MakerDashboard;
