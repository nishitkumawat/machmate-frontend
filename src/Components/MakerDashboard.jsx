import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  ChevronDown,
  Calendar,
  Tag,
  Search,
  X,
  Settings,
  FileText,
  MapPin,
  IndianRupee,
  Clock,
} from "lucide-react";
import Footer from "./Footer.jsx";

const API_HOST = import.meta.env.VITE_API_HOST;

function MakerDashboard({ setIsAuthenticated, setUserRole }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const csrftoken = getCookie("machmate_csrftoken");
  const navigate = useNavigate();

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }


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
  };

  // Filter and sort projects
  const filterAndSortProjects = () => {
    let filteredProjects = openProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

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

  const ProjectTile = ({ project }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
      onClick={() => handleProjectClick(project.id)}
    >
      <div className="p-4">
        {/* Project Name with border */}
        <div className="border border-gray-200 rounded-lg p-3 mb-3">
          <h3 className="text-gray-900 font-semibold text-sm line-clamp-2">
            {project.name}
          </h3>
        </div>

        {/* Project Details */}
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-sm font-medium">₹ {project.price}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-xs">
              {new Date(project.estimatedDate).toLocaleDateString("en-GB")}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1 text-red-600" />
            <span className="text-xs">
              {project.city}, {project.state}
            </span>
          </div>

          {project.pdfUrl && (
            <div className="flex items-center text-gray-600">
              <FileText className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-xs">PDF Available</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 0119 9.414V19a2 2 0 01-2 2z"
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
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => navigate("/subscription")}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
              >
                {userSubscription && userSubscription.plan !== "none" ? (
                  <span className="flex items-center">
                    {userSubscription.plan !== "premium" && (
                      <span className="mr-2">
                        Credits: {userSubscription.remaining_credits}
                      </span>
                    )}
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
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <section id="dashboard">
          {userSubscription && userSubscription.plan === "none" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
            >
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
            </motion.div>
          )}
        </section>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-3 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
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

              <div className="flex flex-row space-x-2 md:hidden">
                <div className="relative w-10">
                  <select
                    name="price"
                    value={filters.price}
                    onChange={handleFilterChange}
                    className="appearance-none w-full h-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" hidden></option>
                    <option value="low">Low to High</option>
                    <option value="high">High to Low</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 left-0 flex items-center justify-center pointer-events-none">
                    <Tag className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

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

            <div className="hidden md:flex flex-row space-x-2">
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
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>

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
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <section id="projects">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Open Projects
            </h2>

            {filteredProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No open projects found matching your criteria.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectTile key={project.id} project={project} />
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* Quotations Section */}
        <section id="quotations" className="mb-12 mt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
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
                  <motion.div
                    key={quotation.quotation_id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 cursor-pointer"
                    onClick={() => handleQuotationClick(quotation)}
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

                    <div className="border-t pt-3 mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Documents:
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {quotation.pdf_quotation && (
                          <a
                            href={`${quotation.pdf_quotation}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Quotation PDF
                          </a>
                        )}

                        {quotation.pdf_report && (
                          <a
                            href={`${quotation.pdf_report}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-green-600 hover:text-green-800 text-sm bg-green-50 px-3 py-1 rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Report PDF
                          </a>
                        )}

                        {!quotation.pdf_quotation && !quotation.pdf_report && (
                          <span className="text-sm text-gray-500">
                            No documents available
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default MakerDashboard;
