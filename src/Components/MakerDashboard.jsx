import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import statesAndCitiesJSON from "../assets/states_and_districts.json";
import {
  ArrowUpDown,
  ChevronDown,
  Calendar,
  Tag,
  Search,
  X,
  Upload,
  Settings,
} from "lucide-react";
import Footer from "./Footer.jsx";

const API_HOST = import.meta.env.VITE_API_HOST;

function MakerDashboard({ setIsAuthenticated, setUserRole }) {
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [quotationData, setQuotationData] = useState({
    amount: "",
    description: "",
    completionDate: "",
    pdf: null,
  });
  const [pdfFileName, setPdfFileName] = useState("");
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    axios.get(API_HOST + "/csrf/", { withCredentials: true });
    fetchOpenProjects();
    checkCompanyProfile();
    fetchUserSubscription();
    fetchUserQuotations();

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

  const fetchUserQuotations = async () => {
    try {
      const response = await axios.get(API_HOST + "/maker/quotations/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      setUserQuotations(response.data);
    } catch (error) {
      console.error("Failed to fetch user quotations", error);
    }
  };

  // Credit checking functions
  const checkCredits = async () => {
    try {
      const response = await axios.get(
        API_HOST + "/subscriptions/check-credits/",
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
        API_HOST + "/subscriptions/use-credit/",
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );
      return response.data;
    } catch (error) {
      console.error("Use credit error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error; // Re-throw to handle in calling function
    }
  };

  const fetchUserSubscription = async () => {
    try {
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
      const response = await axios.get(API_HOST + "/maker/company-details/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      if (response.data && response.data.company_name) {
        setShowCompanyForm(false);
        setUserState(response.data.state);
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
      const response = await axios.get(API_HOST + "/maker/projects/open/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setQuotationData((prev) => ({
        ...prev,
        pdf: file,
      }));
      setPdfFileName(file.name);
    } else {
      alert("Please select a PDF file");
      e.target.value = null;
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateQuotationClick = async (project) => {
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
      const formData = new FormData();
      formData.append("amount", quotationData.amount);
      formData.append("description", quotationData.description);
      formData.append("completionDate", quotationData.completionDate);

      if (quotationData.pdf) {
        formData.append("pdf", quotationData.pdf);
      }

      await axios.post(
        API_HOST + `/maker/projects/${selectedProject.id}/quotation/`,
        formData,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await useCredit();

      setShowQuotationDialog(false);
      setQuotationData({
        amount: "",
        description: "",
        completionDate: "",
        pdf: null,
      });
      setPdfFileName("");

      // Refresh the quotations list
      fetchUserQuotations();
      fetchUserSubscription();

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
        API_HOST + "/maker/company-details/",
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
      setUserState(companyData.state);
      alert("Company profile saved successfully!");
    } catch (error) {
      console.error("Failed to save company profile", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  // Filter and sort projects
  const filterAndSortProjects = () => {
    let filteredProjects = openProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Split into same state and other states
    let sameStateProjects = filteredProjects.filter(
      (project) => project.state === userState
    );
    let otherStateProjects = filteredProjects.filter(
      (project) => project.state !== userState
    );

    // Sort by price
    const sortByPrice = (projects, order) => {
      return [...projects].sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return order === "low" ? priceA - priceB : priceB - priceA;
      });
    };

    // Sort by date
    const sortByDate = (projects, order) => {
      return [...projects].sort((a, b) => {
        const dateA = new Date(a.estimatedDate);
        const dateB = new Date(b.estimatedDate);
        return order === "oldest" ? dateA - dateB : dateB - dateA;
      });
    };

    // Apply sorting
    if (filters.price) {
      sameStateProjects = sortByPrice(sameStateProjects, filters.price);
      otherStateProjects = sortByPrice(otherStateProjects, filters.price);
    }

    if (filters.date) {
      sameStateProjects = sortByDate(sameStateProjects, filters.date);
      otherStateProjects = sortByDate(otherStateProjects, filters.date);
    }

    return { sameStateProjects, otherStateProjects };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        {/* Rotating gear icon */}
        <Settings
          size={60}
          color="#1e90ff"
          style={{ animation: "spin 3s linear infinite" }}
        />

        {/* Loading text */}
        <p className="mt-4 text-blue-600 text-lg font-medium">
          Getting Your Site Ready...
        </p>

        {/* Inline keyframes for spin */}
        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  const { sameStateProjects, otherStateProjects } = filterAndSortProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 
                012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 
                0119 9.414V19a2 2 0 01-2 极速2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  MachMate
                </span>
              </div>
            </div>

            {/* Desktop Links */}
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

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => navigate("/subscription")}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
              >
                {userSubscription && userSubscription.plan !== "none" ? (
                  <span className="flex items-center">
                    <span className="mr-2">
                      Credits: {userSubscription.remaining_credits}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {userSubscription.plan}
                    </span>
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
              <button
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
                onClick={() => navigate("/makerprofile")}
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Logout
              </button>
            </div>

            {/* Mobile Toggler */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-md">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a
                href="#dashboard"
                className="block text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </a>
              <a
                href="#quotations"
                className="block text-gray-700 hover:text-blue-600"
              >
                My Quotations
              </a>
              <a
                href="#projects"
                className="block text-gray-700 hover:text-blue-600"
              >
                Active Projects
              </a>
              <button
                onClick={() => navigate("/subscription")}
                className="block w-full text-left text-gray-700 hover:text-blue-600"
              >
                {userSubscription && userSubscription.plan !== "none"
                  ? `Credits: ${userSubscription.remaining_credits} (${userSubscription.plan})`
                  : "Subscribe"}
              </button>
              <button
                className="block w-full text-left text-gray-700 hover:text-blue-600"
                onClick={() => navigate("/makerprofile")}
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        )}
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
                      className="block text-gray-700 text极速-sm font-medium mb-2"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      value={companyData.state}
                      onChange={handleCompanyInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="city"
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
                      disabled={!companyData.state}
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
        <section id="dashboard" className="">
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
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5极速.58-9.92zM11 13a1 1 0 11-2 0 1 1 极速0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
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
        <div className="bg-white rounded-xl shadow-md p-3 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search Bar */}
            <div className="flex w-full md:flex-1 items-center space-x-2">
              <div className="relative flex-grow md:flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 md:w-full w-[70%]"
                />
              </div>

              {/* Filters inline on small screens - icon only */}
              <div className="flex flex-row space-x-2 md:hidden">
                {/* Price Sort */}
                <div className="relative w-10">
                  <select
                    name="price"
                    value={filters.price}
                    onChange={handleFilterChange}
                    className="appearance-none w-full h-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "
                  >
                    <option value="" hidden></option>
                    <option value="low">Low to High</option>
                    <option value="high">High to Low</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 left-0 flex items-center justify-center pointer-events-none">
                    <Tag className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* Date Sort */}
                <div className="relative w-10">
                  <select
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="appearance-none w-full h-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-transparent"
                  >
                    <option value="" hidden></option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 left-0 flex items-center justify-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters full view on desktop */}
            <div className="hidden md:flex flex-row space-x-2">
              {/* Price Sort */}
              <div className="relative">
                <select
                  name="price"
                  value={filters.price}
                  onChange={handleFilterChange}
                  className="appearance-none px-3 py-2 border border-gray-300 rounded-md pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" hidden>
                    Price
                  </option>
                  <option value="low">Low to High</option>
                  <option value="high">High to Low</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <ArrowUpDown className="w-4 h-4 text-gray-500 block md:hidden" />
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </div>
              </div>

              {/* Date Sort */}
              <div className="relative">
                <select
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="appearance-none px-3 py-2 border border-gray-300 rounded-md pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" hidden>
                    Date
                  </option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <ArrowUpDown className="w-4 h-4 text-gray-500 block md:hidden" />
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Open Projects List */}
        <section id="projects">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Open Projects
            </h2>

            {sameStateProjects.length === 0 &&
            otherStateProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No open projects found matching your criteria.
              </p>
            ) : (
              <div>
                {/* Same State Projects */}
                {sameStateProjects.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-green-700 mb-4 flex items-center">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Projects in Your State ({userState})
                    </h3>
                    <div className="space-y-4">
                      {sameStateProjects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition duration-300"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Side - Project Details */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {project.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                  ₹ {project.price}
                                </span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                                  Due:{" "}
                                  {new Date(
                                    project.estimatedDate
                                  ).toLocaleDateString("en-GB")}
                                </span>
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                  {project.city}, {project.state}
                                </span>
                              </div>
                            </div>
                            {/* Right Side - Quotations */}
                            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                Top Quotations
                              </h4>
                              <div className="space-y-3">
                                {project.quotations &&
                                project.quotations.length > 0 ? (
                                  project.quotations
                                    .sort((a, b) => a.price - b.price)
                                    .slice(0, 3)
                                    .map((q, index) => (
                                      <div
                                        key={index}
                                        className="text-xs p-2 rounded-md bg-indigo-100/50 flex justify-between items-start"
                                      >
                                        {/* Left Side: Price + Description */}
                                        <div>
                                          <p className="font-semibold text-indigo-900">
                                            ₹ {q.price}
                                          </p>
                                          <p className="text-gray-500">
                                            {q.description}
                                          </p>
                                        </div>

                                        {/* Right Side: Vendor + Completion */}
                                        <div className="text-right">
                                          <p className="text-gray-700">
                                            Vendor: {q.vendorName}
                                          </p>
                                          <p className="text-gray-600">
                                            Completion:{" "}
                                            {new Date(
                                              q.estimated_date
                                            ).toLocaleDateString("en-GB")}
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                ) : (
                                  <p className="text-gray-500 text-xs italic">
                                    No quotations yet
                                  </p>
                                )}
                              </div>

                              {/* Add Quotation Button */}
                              <button
                                onClick={() =>
                                  handleCreateQuotationClick(project)
                                }
                                disabled={
                                  userSubscription &&
                                  userSubscription.plan === "none"
                                }
                                className={`mt-4 w-full px-3 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                                  userSubscription &&
                                  userSubscription.plan === "none"
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                              >
                                {userSubscription &&
                                userSubscription.plan === "none"
                                  ? "Subscribe to Quote"
                                  : "Add Your Quotation"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other State Projects */}
                {otherStateProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Projects in Other States
                    </h3>
                    <div className="space-y-4">
                      {otherStateProjects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition duration-300"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Side - Project Details */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {project.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                  ₹ {project.price}
                                </span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                                  Due:{" "}
                                  {new Date(
                                    project.estimatedDate
                                  ).toLocaleDateString("en-GB")}
                                </span>
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                  {project.city}, {project.state}
                                </span>
                              </div>
                            </div>

                            {/* Right Side - Quotations */}
                            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                Top Quotations
                              </h4>
                              <div className="space-y-2">
                                {project.quotations &&
                                project.quotations.length > 0 ? (
                                  project.quotations
                                    .sort((a, b) => a.price - b.price)
                                    .slice(0, 3)
                                    .map((q, index) => (
                                      <div
                                        key={index}
                                        className="bg-white p-3 rounded-lg shadow-sm border text-xs hover:shadow-md transition"
                                      >
                                        <p className="font-semibold text-gray-900">
                                          ₹ {q.price}
                                        </p>
                                        <p className="text-gray-600">
                                          Vendor: {q.vendorName}
                                        </p>
                                        <p className="text-gray-500">
                                          Completion:{" "}
                                          {new Date(
                                            q.completionDate
                                          ).toLocaleDateString("en-GB")}
                                        </p>
                                        <p className="text-gray-500">
                                          {q.description}
                                        </p>
                                      </div>
                                    ))
                                ) : (
                                  <p className="text-gray-500 text-xs italic">
                                    No quotations yet
                                  </p>
                                )}
                              </div>

                              {/* Add Quotation Button */}
                              <button
                                onClick={() =>
                                  handleCreateQuotationClick(project)
                                }
                                disabled={
                                  userSubscription &&
                                  userSubscription.plan === "none"
                                }
                                className={`mt-4 w-full px-3 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                                  userSubscription &&
                                  userSubscription.plan === "none"
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                              >
                                {userSubscription &&
                                userSubscription.plan === "none"
                                  ? "Subscribe to Quote"
                                  : "Add Your Quotation"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Quotations Section */}
        <section id="quotations" className="mb-12 mt-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Quotations
            </h2>

            {userQuotations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                You haven't submitted any quotations yet.
              </p>
            ) : (
              <div className="space-y-6">
                {userQuotations.map((quotation) => (
                  <div
                    key={quotation.quotation_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {quotation.project_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {quotation.project_description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Quoted: ₹ {quotation.price}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Budget: ₹ {quotation.project_budget}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Completion:{" "}
                            {new Date(
                              quotation.estimated_date
                            ).toLocaleDateString("en-GB")}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              quotation.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : quotation.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Status:{" "}
                            {quotation.status.charAt(0).toUpperCase() +
                              quotation.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Submitted on{" "}
                          {new Date(quotation.created_at).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Buyer: {quotation.buyer_name}
                        </p>
                      </div>
                    </div>

                    {/* PDF Downloads Section */}
                    <div className="border-t pt-3 mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Documents:
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {/* Quotation PDF */}
                        {quotation.pdf_quotation && (
                          <a
                            href={`${quotation.pdf_quotation}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Quotation PDF
                          </a>
                        )}

                        {/* Report PDF - Assuming your backend returns this as pdf_report */}
                        {quotation.pdf_report && (
                          <a
                            href={`${quotation.pdf_report}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-green-600 hover:text-green-800 text-sm bg-green-50 px-3 py-1 rounded"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Report PDF
                          </a>
                        )}

                        {/* If no PDFs available */}
                        {!quotation.pdf_quotation && !quotation.pdf_report && (
                          <span className="text-sm text-gray-500">
                            No documents available
                          </span>
                        )}
                      </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Quotation
                </h2>
                <button
                  onClick={() => {
                    setShowQuotationDialog(false);
                    setQuotationData({
                      amount: "",
                      description: "",
                      completionDate: "",
                      pdf: null,
                    });
                    setPdfFileName("");
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
                >
                  <X className="h-6 w-6" />
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
                    Quotation Amount (₹)
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

                {/* PDF Upload Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Upload Quotation (PDF)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF only (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        id="pdf-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {pdfFileName && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected file: {pdfFileName}
                    </p>
                  )}
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
                    onClick={() => {
                      setShowQuotationDialog(false);
                      setQuotationData({
                        amount: "",
                        description: "",
                        completionDate: "",
                        pdf: null,
                      });
                      setPdfFileName("");
                    }}
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
      <Footer />
    </div>
  );
}

export default MakerDashboard;
