import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import statesAndCitiesJSON from "../assets/states_and_districts.json";

function MakerDashboard({ setIsAuthenticated, setUserRole }) {
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [quotationData, setQuotationData] = useState({
    amount: "",
    description: "",
    completionDate: "",
    pdfUrl: "", // Added pdfUrl field
  });
  const [filters, setFilters] = useState({
    price: "",
    date: "",
    location: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [openProjects, setOpenProjects] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);

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

  const statesAndCities = statesAndCitiesJSON;

  useEffect(() => {
    axios.get("http://localhost:8000/csrf/", { withCredentials: true });
    fetchOpenProjects();
    checkCompanyProfile();
    fetchUserSubscription();

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

  // Credit checking functions
  const checkCredits = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/subscriptions/check-credits/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      return response.data.has_credits;
    } catch (error) {
      console.error("Credit check error:", error);
      return false;
    }
  };

  const useCredit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/subscriptions/use-credit/",
        {},
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      return response.data.success;
    } catch (error) {
      console.error("Use credit error:", error);
      return false;
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/subscriptions/user-subscription/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      setUserSubscription(response.data);
    } catch (error) {
      console.error("Failed to fetch subscription data", error);
    }
  };

  const checkCompanyProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/maker/company-details/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );

      if (response.data && response.data.company_name) {
        setShowCompanyForm(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setShowCompanyForm(true);
      } else {
        console.error("Failed to check company profile", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { city: "" } : {}),
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateQuotationClick = async (project) => {
    // Check if user has credits available
    const canSubmit = await checkCredits();
    if (!canSubmit) {
      alert(
        "No credits available. Please upgrade your subscription to submit quotations."
      );
      return;
    }

    setSelectedProject(project);
    setShowQuotationDialog(true);
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

      // Deduct credit after successful quotation submission
      await useCredit();

      setShowQuotationDialog(false);
      alert("Quotation submitted successfully!");

      // Refresh subscription data to update credit count
      fetchUserSubscription();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:极速-8">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.极速 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.极速-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 极速2a3 3 0 11-6 0 3 3 0 016 0z"
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
                    : "text-gray-600 hover:text-blue-极速"
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
              <button
                onClick={() => navigate("/subscription")}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
              >
                {userSubscription && userSubscription.plan !== "none" ? (
                  <span className="flex items-center">
                    <span className="mr-2">
                      Credits: {userSubscription.credits}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {userSubscription.plan}
                    </span>
                  </span>
                ) : (
                  "Subscribe"
                )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:极速line-none focus:ring-2 focus:ring-blue-500"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* State Dropdown */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-极速"
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

                  {/* City Dropdown */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!projectData.state} // disable if no state selected
                    >
                      <option value="">Select City</option>
                      {projectData.state &&
                        statesAndCities[projectData.state].map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
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
          {/* Subscription Status Banner */}
          {userSubscription && userSubscription.plan === "none" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-yellow-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-yellow-800">
                  You need an active subscription to submit quotations.{" "}
                  <button
                    onClick={() => navigate("/subscription")}
                    className="font-medium underline hover:text-yellow-900"
                  >
                    Subscribe now
                  </button>
                </p>
              </div>
            </div>
          )}
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
                      d="M8 4a4 4  100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                            ₹ {project.price}
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
                        onClick={() => handleCreateQuotationClick(project)}
                        disabled={
                          userSubscription && userSubscription.plan === "none"
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-md transition duration-300 whitespace-nowrap ${
                          userSubscription && userSubscription.plan === "none"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {userSubscription && userSubscription.plan === "none"
                          ? "Subscribe to Quote"
                          : "Create Quotation"}
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
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={quotationData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Describe your quotation and what services you'll provide"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text极速 font-medium mb-2"
                    htmlFor="pdfUrl"
                  >
                    PDF URL (optional)
                  </label>
                  <input
                    type="url"
                    id="pdfUrl"
                    name="pdfUrl"
                    value={quotationData.pdfUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Link to your detailed quotation PDF"
                  />
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
