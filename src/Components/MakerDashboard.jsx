import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import machmateLogo from "../assets/logo-dark.png";
import {
  ChevronDown,
  Calendar,
  Tag,
  Search,
  Settings,
  FileText,
  MapPin,
  IndianRupee,
  Menu,
  X,
  Home,
  Quote,
  LogOut,
  User,
  CreditCard,
} from "lucide-react";
import statesAndCitiesJSON from "../assets/states_and_districts.json";

const API_HOST = import.meta.env.VITE_API_HOST;

function MakerDashboard({ setIsAuthenticated, setUserRole }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [filters, setFilters] = useState({
    price: "",
    date: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [openProjects, setOpenProjects] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);
  const [userState, setUserState] = useState("");
  const [userQuotations, setUserQuotations] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [companyFormData, setCompanyFormData] = useState({
    company_name: "",
    year_established: "",
    company_description: "",
    specializations: [],
    address: "",
    state: "",
    city: "",
    website: "",
  });
  const [availableCities, setAvailableCities] = useState([]);

  const navigate = useNavigate();

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Get states from JSON data
  const states = Object.keys(statesAndCitiesJSON);

  // Update cities when state changes
  useEffect(() => {
    if (companyFormData.state) {
      const cities = statesAndCitiesJSON[companyFormData.state] || [];
      setAvailableCities(cities);

      // Reset city if it's not in the new state's cities
      if (companyFormData.city && !cities.includes(companyFormData.city)) {
        setCompanyFormData((prev) => ({
          ...prev,
          city: "",
        }));
      }
    } else {
      setAvailableCities([]);
      setCompanyFormData((prev) => ({
        ...prev,
        city: "",
      }));
    }
  }, [companyFormData.state]);

  useEffect(() => {
    const csrftoken = getCookie("machmate_csrftoken");
    axios.get(API_HOST + "/csrf/", { withCredentials: true });
    fetchOpenProjects();
    checkCompanyProfile();
    fetchUserSubscription();
    fetchUserQuotations();
  }, []);

  const fetchUserQuotations = async () => {
    try {
      const csrftoken = getCookie("machmate_csrftoken");
      const response = await axios.get(API_HOST + "/maker/quotations/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      setUserQuotations(response.data);
    } catch (error) {
      console.error("Failed to fetch user quotations", error);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const csrftoken = getCookie("machmate_csrftoken");
      const response = await axios.get(
        API_HOST + "/subscriptions/user-subscription/",
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
      const csrftoken = getCookie("machmate_csrftoken");
      const response = await axios.get(API_HOST + "/maker/company-details/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      if (response.data && response.data.company_name) {
        setShowCompanyForm(false);
        setUserState(response.data.state);
        // Set existing company data
        setCompanyFormData({
          company_name: response.data.company_name || "",
          year_established: response.data.year_established || "",
          company_description: response.data.company_description || "",
          specializations: response.data.specializations || [],
          address: response.data.address || "",
          state: response.data.state || "",
          city: response.data.city || "",
          website: response.data.website || "",
        });
      } else {
        setShowCompanyForm(true);
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
      const csrftoken = getCookie("machmate_csrftoken");
      const response = await axios.get(API_HOST + "/maker/projects/open/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      setOpenProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch open projects", error);
    }
  };

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    setCompanyFormData((prev) => {
      let newSpecializations;
      if (checked) {
        newSpecializations = [...prev.specializations, value];
      } else {
        newSpecializations = prev.specializations.filter(
          (item) => item !== value
        );
      }
      return {
        ...prev,
        specializations: newSpecializations,
      };
    });
  };

  const handleCompanyFormSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "company_name",
      "year_established",
      "company_description",
      "address",
      "state",
      "city",
    ];
    for (const field of requiredFields) {
      if (!companyFormData[field]) {
        alert(`Please fill in the ${field.replace("_", " ")}`);
        return;
      }
    }

    // Validate specializations
    if (companyFormData.specializations.length === 0) {
      alert("Please select at least one specialization");
      return;
    }

    setIsSubmitting(true);

    try {
      const csrftoken = getCookie("machmate_csrftoken");
      const response = await axios.post(
        API_HOST + "/maker/company-details/",
        companyFormData,
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );

      if (response.status === 201) {
        setShowCompanyForm(false);
        setUserState(companyFormData.state);
      }
    } catch (error) {
      console.error("Failed to save company details", error);
      alert("Failed to save company details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      const csrftoken = getCookie("machmate_csrftoken");
      await axios.post(
        API_HOST + "/auth/logout/",
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
    setMobileMenuOpen(false);
  };

  const filterAndSortProjects = () => {
    let filteredProjects = openProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const sortByPrice = (projects, order) => {
      return [...projects].sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return order === "low" ? priceA - priceB : priceB - priceA;
      });
    };

    const sortByDate = (projects, order) => {
      return [...projects].sort((a, b) => {
        const dateA = new Date(a.estimatedDate);
        const dateB = new Date(b.estimatedDate);
        return order === "oldest" ? dateA - dateB : dateB - dateA;
      });
    };

    if (filters.price) {
      filteredProjects = sortByPrice(filteredProjects, filters.price);
    }

    if (filters.date) {
      filteredProjects = sortByDate(filteredProjects, filters.date);
    }

    return filteredProjects;
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleQuotationClick = (quotation) => {
    navigate(`/project/${quotation.work_id}`);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Settings
          size={60}
          color="#1e90ff"
          style={{ animation: "spin 3s linear infinite" }}
        />
        <p className="mt-4 text-blue-600 text-lg font-medium">
          Getting Your Site Ready...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const filteredProjects = filterAndSortProjects();

  const specializationsList = [
    "CNC Project",
    "VMC Machining Job",
    "Wirecut / EDM Project",
    "Laser Cutting Job",
    "Grinding / Finishing Job",
    "Hobbing / Gear Manufacturing",
    "Slotting Project",
  ];

  const ProjectCard = ({ project }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => handleProjectClick(project.id)}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {project.name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-gray-700">
              <MapPin className="h-4 w-4 mr-1 text-red-600" />
              <span className="text-sm">
                {project.city}, {project.state}
              </span>
            </div>
            {project.pdfUrl && (
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-1 text-purple-600" />
                <span className="text-sm">PDF Available</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-6 lg:text-right">
          <div className="flex items-center justify-start lg:justify-end text-2xl font-bold text-green-600 mb-2">
            <IndianRupee className="h-5 w-5 mr-1" />
            {project.price}
          </div>
          <div className="flex items-center justify-start lg:justify-end text-gray-600">
            <Calendar className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-sm">
              {new Date(project.estimatedDate).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const QuotationCard = ({ quotation }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => handleQuotationClick(quotation)}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              {quotation.project_name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                quotation.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : quotation.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {quotation.status.charAt(0).toUpperCase() +
                quotation.status.slice(1)}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{quotation.project_description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-blue-600" />
              <span>Buyer: {quotation.buyer_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-blue-600" />
              <span>
                Submitted:{" "}
                {new Date(quotation.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {quotation.pdf_quotation && (
              <a
                href={`${quotation.pdf_quotation}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Quotation PDF
              </a>
            )}

            {quotation.pdf_report && (
              <a
                href={`${quotation.pdf_report}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-600 hover:text-green-800 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Report PDF
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-6 lg:text-right">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-green-600">
              <IndianRupee className="h-4 w-4 inline mr-1" />
              {quotation.price}
            </div>
            <div className="text-sm text-gray-600">
              Budget: <IndianRupee className="h-3 w-3 inline mr-1" />
              {quotation.project_budget}
            </div>
            <div className="text-sm text-gray-600">
              Due:{" "}
              {new Date(quotation.estimated_date).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Company Form Modal */}
      {showCompanyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Company Details
              </h2>
              <p className="text-gray-600 mb-6">
                Please complete your company profile to start bidding on
                projects
              </p>

              <form onSubmit={handleCompanyFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={companyFormData.company_name}
                    onChange={handleCompanyFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Established *
                  </label>
                  <input
                    type="number"
                    name="year_established"
                    value={companyFormData.year_established}
                    onChange={handleCompanyFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyFormData.website}
                    onChange={handleCompanyFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={companyFormData.address}
                    onChange={handleCompanyFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={companyFormData.state}
                      onChange={handleCompanyFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      name="city"
                      value={companyFormData.city}
                      onChange={handleCompanyFormChange}
                      required
                      disabled={!companyFormData.state}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {companyFormData.state
                          ? "Select City"
                          : "Select State First"}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specializations *
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      Select the specializations your company offers:
                    </p>
                    <div className="space-y-2">
                      {specializationsList.map((specialization) => (
                        <div key={specialization} className="flex items-center">
                          <input
                            type="checkbox"
                            id={specialization}
                            value={specialization}
                            checked={companyFormData.specializations.includes(
                              specialization
                            )}
                            onChange={handleSpecializationChange}
                            className="h-4 w-4 border border-gray-400 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 appearance-none cursor-pointer relative
             after:content-[''] after:absolute after:hidden checked:after:block
             after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px]
             after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                          />
                          <label
                            htmlFor={specialization}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {specialization}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {companyFormData.specializations.length}
                        </span>{" "}
                        specialization(s) selected
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description *
                  </label>
                  <textarea
                    name="company_description"
                    value={companyFormData.company_description}
                    onChange={handleCompanyFormChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your company, services, and expertise..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Company Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <div
          className={`fixed top-0 left-0 h-full bg-white shadow-xl z-30 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center p-6 border-b border-gray-200">
              <div className=" h-8 w-8 rounded-md flex items-center justify-center ">
                <img
                  src={machmateLogo}
                  alt="MachMate Logo"
                  className="h-10 w-10 mr-2 object-contain"
                />
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold text-blue-600">
                  MachMate
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => handleNavigation("dashboard")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "dashboard"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Home className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">Dashboard</span>
                )}
              </button>

              <button
                onClick={() => handleNavigation("quotations")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "quotations"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Quote className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">My Quotations</span>
                )}
              </button>

              <button
                onClick={() => navigate("/makerprofile")}
                className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">Profile</span>
                )}
              </button>

              <button
                onClick={() => navigate("/subscription")}
                className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">
                    {userSubscription && userSubscription.plan !== "none" ? (
                      <span className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                          {userSubscription.plan}
                        </span>
                        {userSubscription.plan !== "premium" && (
                          <span className="text-sm">
                            ({userSubscription.remaining_credits} credits)
                          </span>
                        )}
                      </span>
                    ) : (
                      "Subscribe"
                    )}
                  </span>
                )}
              </button>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                {sidebarOpen && (
                  <span className="ml-3 font-medium">Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeSection === "dashboard"
                    ? "Open Projects"
                    : "My Quotations"}
                </h1>
              </div>

              {userSubscription && userSubscription.plan === "none" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    You need an active subscription to submit quotations.{" "}
                    <button
                      onClick={() => navigate("/subscription")}
                      className="font-medium underline hover:text-yellow-900"
                    >
                      Subscribe now
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <div className="relative">
                        <select
                          name="price"
                          value={filters.price}
                          onChange={handleFilterChange}
                          className="appearance-none px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Price</option>
                          <option value="low">Low to High</option>
                          <option value="high">High to Low</option>
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>

                      <div className="relative">
                        <select
                          name="date"
                          value={filters.date}
                          onChange={handleFilterChange}
                          className="appearance-none px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Date</option>
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">
                        No open projects found matching your criteria.
                      </p>
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === "quotations" && (
              <div className="space-y-4">
                {userQuotations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      You haven't submitted any quotations yet.
                    </p>
                  </div>
                ) : (
                  userQuotations.map((quotation) => (
                    <QuotationCard
                      key={quotation.quotation_id}
                      quotation={quotation}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-blue-600">MachMate</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleNavigation("dashboard")}
              className={`flex-1 py-3 text-center font-medium ${
                activeSection === "dashboard"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Open Projects
            </button>
            <button
              onClick={() => handleNavigation("quotations")}
              className={`flex-1 py-3 text-center font-medium ${
                activeSection === "quotations"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Quotations
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-white">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    MachMate
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              <button
                onClick={() => navigate("/makerprofile")}
                className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5 mr-3" />
                <span className="font-medium">Profile</span>
              </button>

              <button
                onClick={() => navigate("/subscription")}
                className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <span className="font-medium">
                  {userSubscription && userSubscription.plan !== "none" ? (
                    <span className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                        {userSubscription.plan}
                      </span>
                      {userSubscription.plan !== "premium" && (
                        <span className="text-sm">
                          ({userSubscription.remaining_credits} credits)
                        </span>
                      )}
                    </span>
                  ) : (
                    "Subscribe"
                  )}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        )}

        {/* Mobile Content */}
        <div className="p-4">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <select
                        name="price"
                        value={filters.price}
                        onChange={handleFilterChange}
                        className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Price</option>
                        <option value="low">Low to High</option>
                        <option value="high">High to Low</option>
                      </select>
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>

                    <div className="relative flex-1">
                      <select
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Date</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No open projects found matching your criteria.
                    </p>
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === "quotations" && (
            <div className="space-y-4">
              {userQuotations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    You haven't submitted any quotations yet.
                  </p>
                </div>
              ) : (
                userQuotations.map((quotation) => (
                  <QuotationCard
                    key={quotation.quotation_id}
                    quotation={quotation}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MakerDashboard;
