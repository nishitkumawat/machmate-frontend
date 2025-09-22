import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import statesAndCitiesJSON from "../assets/states_and_districts.json";
import Footer from "./Footer.jsx";
import { Settings } from "lucide-react"; // gear icon

const API_HOST = import.meta.env.VITE_API_HOST;

function BuyerDashboard({ setIsAuthenticated, setUserRole }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMobileGallery, setShowMobileGallery] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [showQuotationsDialog, setShowQuotationsDialog] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    maxPrice: 10000,
    estimatedDate: "",
    address: "",
    state: "",
    city: "",
    pdf: null,
  });
  const [pdfFileName, setPdfFileName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();
  // Mock data for demonstration
  useEffect(() => {
    axios.get(API_HOST + "/csrf/", { withCredentials: true });

    fetchProjects();
    fetchCompletedOrders();

    setIsLoading(false);
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

    // Mock projects data
    setProjects([
      {
        id: 1,
        name: "Custom CNC Parts",
        description: "Need precision CNC machined parts for automotive project",
        maxPrice: 15000,
        estimatedDate: "2024-02-15",
        pdfUrl: null,
      },
      {
        id: 2,
        name: "3D Printed Prototypes",
        description: "Rapid prototyping for product development",
        maxPrice: 8000,
        estimatedDate: "2024-02-20",
        pdfUrl: null,
      },
    ]);

    // Mock completed orders
    setCompletedOrders([
      {
        completedId: 1,
        projectName: "Metal Brackets",
        projectDescription: "Custom metal brackets for industrial equipment",
        makerName: "John Smith",
        makerEmail: "john@example.com",
        quotationAmount: 12000,
        quotationMessage: "High quality steel brackets with powder coating",
        amount: 12000,
        completionDate: "2024-01-15",
        report: "https://example.com/report1.pdf",
      },
    ]);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const templates = [
    {
      id: 1,
      name: "Contact Information",
      description: "Collect contact details from customers",
      image: "https://dummyimage.com/300x200/4CAF50/ffffff?text=Contact+Form",
      category: "Business",
    },
    {
      id: 2,
      name: "RSVP",
      description: "Event response and attendance tracking",
      image: "https://dummyimage.com/300x200/2196F3/ffffff?text=RSVP+Form",
      category: "Events",
    },
    {
      id: 3,
      name: "Party Invite",
      description: "Party invitation and guest management",
      image: "https://dummyimage.com/300x200/FF9800/ffffff?text=Party+Invite",
      category: "Events",
    },
    {
      id: 4,
      name: "T-Shirt Sign Up",
      description: "T-shirt order and size collection",
      image: "https://dummyimage.com/300x200/9C27B0/ffffff?text=T-Shirt+Order",
      category: "Orders",
    },
    {
      id: 5,
      name: "Event Registration",
      description: "Complete event registration form",
      image:
        "https://dummyimage.com/300x200/795548/ffffff?text=Event+Registration",
      category: "Events",
    },
  ];

  const fetchProjects = async () => {
    try {
      const response = await axios.get(API_HOST + "/buyer/projects/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await axios.get(API_HOST + "/buyer/orders/completed/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      setCompletedOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch completed orders", error);
    }
  };

  const fetchQuotations = async (projectId) => {
    try {
      const response = await axios.get(
        API_HOST + `/buyer/projects/${projectId}/quotations/`,
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );
      setQuotations(response.data);
      setSelectedProjectId(projectId);
      setShowQuotationsDialog(true);
    } catch (error) {
      console.error("Failed to fetch quotations", error);
    }
  };

  const acceptQuotation = async (quotationId) => {
    try {
      await axios.post(
        API_HOST + `/buyer/quotations/${quotationId}/accept/`,
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );

      // Refresh data
      fetchProjects();
      fetchCompletedOrders();
      setShowQuotationsDialog(false);
      alert(
        "Quotation accepted successfully! The project has been moved to completed orders."
      );
    } catch (error) {
      console.error("Failed to accept quotation", error);
      alert("Failed to accept quotation. Please try again.");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setProjectData((prev) => ({
        ...prev,
        pdf: file,
      }));
      setPdfFileName(file.name);
    } else {
      alert("Please select a PDF file");
      e.target.value = null;
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Validate that date is not in the past
    const selectedDate = new Date(projectData.estimatedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison

    if (selectedDate < today) {
      alert("Estimated completion date cannot be in the past");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", projectData.name);
      formData.append("description", projectData.description);
      formData.append("maxPrice", projectData.maxPrice);
      formData.append("estimatedDate", projectData.estimatedDate);
      formData.append("address", projectData.address);
      formData.append("state", projectData.state);
      formData.append("city", projectData.city);

      if (projectData.pdf) {
        formData.append("pdf", projectData.pdf);
      }

      if (editingProject) {
        // Update existing project - use POST instead of PUT
        await axios.post(
          API_HOST + `/buyer/projects/${editingProject.id}/update/`,
          formData,
          {
            withCredentials: true,
            headers: {
              "X-CSRFToken": csrftoken,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new project
        await axios.post(API_HOST + "/buyer/projects/create/", formData, {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowProjectForm(false);
      setEditingProject(null);
      setProjectData({
        name: "",
        description: "",
        maxPrice: 10000,
        estimatedDate: "",
        address: "",
        state: "",
        city: "",
        pdf: null,
      });
      setPdfFileName("");

      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error("Failed to save project", error);
      alert("Failed to save project. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectData({
      name: project.name,
      description: project.description,
      maxPrice: project.maxPrice,
      estimatedDate: project.estimatedDate,
      address: project.address,
      state: project.state,
      city: project.city,
      pdf: null, // Reset file when editing
    });
    setPdfFileName(project.pdf ? "Existing file uploaded" : "");
    setShowProjectForm(true);
  };

  const handleDownloadPdf = (project) => {
    if (!project.pdfUrl) return;
    const link = document.createElement("a");
    link.href = project.pdfUrl;
    link.download = project.name + ".pdf";
    link.target = "_blank";
    link.click();
  };

  const handleDownloadQuotationPdf = (quotation) => {
    if (!quotation.pdf_quotation) return;
    const link = document.createElement("a");
    link.href = quotation.pdf_quotation;
    link.download = `quotation_${quotation.quotation_id}.pdf`;
    link.target = "_blank";
    link.click();
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
    } catch (error) {
      console.error("Logout failed", err);
    }

    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
  };

  // Function to truncate description to a certain length
  const truncateDescription = (description, maxLength = 100) => {
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const handleDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProject = async () => {
    try {
      await axios.delete(API_HOST + `/buyer/projects/${projectToDelete}/`, {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });

      // Refresh projects list
      fetchProjects();
      setShowDeleteDialog(false);
      setProjectToDelete(null);
      alert("Project deleted successfully!");
    } catch (error) {
      console.error("Failed to delete project", error);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        handleLogout();
      } else if (error.response?.status === 403) {
      } else if (error.response?.status === 404) {
      } else {
      }
    }
  };

  const statesAndCities = statesAndCitiesJSON;

  // Get today's date in YYYY-MM-DD format for the date input min attribute
  const today = new Date().toISOString().split("T")[0];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-blue-600 h-8 w-8 rounded-md flex items-center justify-center mr-2">
                  {/* Your logo icon */}
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  MachMate
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
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
                href="#projects"
                className={`px-3 py-2 font-medium ${
                  activeSection === "projects"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                My Projects
              </a>
              <a
                href="#orders"
                className={`px-3 py-2 font-medium ${
                  activeSection === "orders"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Previous Orders
              </a>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
                onClick={() => navigate("/buyerprofile")}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {/* Hamburger Icon */}
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    // Close Icon
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    // Hamburger Icon
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <a
              href="#dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </a>
            <a
              href="#projects"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              My Projects
            </a>
            <a
              href="#orders"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Previous Orders
            </a>
            <button
              onClick={() => navigate("/buyerprofile")}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Start a new form section */}
        <section className="mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Project
          </h1>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              Start a new Project
            </h2>
          </div>

          {/* ---------- Mobile View (left: black button, right: white button with horizontal scroll) ---------- */}
          <div className="sm:hidden flex justify-between mb-4 space-x-2">
            {/* Left: Create New Project */}
            <button
              onClick={() => setShowProjectForm(true)}
              className="flex-1 bg-black text-white px-4 py-4 rounded-lg font-medium hover:bg-gray-800 transition text-center"
            >
              Create New Project
            </button>

            {/* Right: Templates (horizontal scroll toggle) */}
            <div className="flex-1 relative">
              {!showMobileGallery ? (
                <button
                  onClick={() => setShowMobileGallery(true)}
                  className="w-full bg-white border border-gray-300 px-4 py-4 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition text-center"
                >
                  Templates
                </button>
              ) : (
                <div className="absolute top-0 left-0 w-full overflow-x-auto flex space-x-2 py-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex-shrink-0 w-40 bg-white rounded-lg border border-gray-200 p-3 cursor-pointer flex items-center justify-center text-center"
                      onClick={() => {
                        setShowMobileGallery(false);
                        setShowProjectForm(true);
                      }}
                    >
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {template.name}
                      </h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------- Desktop/Grid View ---------- */}
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Blank Form */}
            <div
              className="template-card bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setShowProjectForm(true)}
            >
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">
                Blank form
              </h3>
            </div>

            {/* Some Template Cards */}
            {templates.slice(0, 5).map((template) => (
              <div
                key={template.id}
                className="template-card bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setShowProjectForm(true)}
              >
                <div className="aspect-square">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 text-center truncate">
                    {template.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Template Gallery Modal (desktop only) ---------- */}
          {showTemplateGallery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Template gallery
                    </h2>
                    <button
                      onClick={() => setShowTemplateGallery(false)}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="template-card bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => {
                          setShowTemplateGallery(false);
                          setShowProjectForm(true);
                        }}
                      >
                        <div className="aspect-video">
                          <img
                            src={template.image}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------- Project Form ---------- */}
          {showProjectForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto relative">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingProject ? "Edit Project" : "Create New Project"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProject(null);
                        setProjectData({
                          name: "",
                          description: "",
                          maxPrice: 10000,
                          estimatedDate: "",
                          address: "",
                          state: "",
                          city: "",
                          pdf: null,
                        });
                        setPdfFileName("");
                      }}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmitProject}>
                    {/* Project fields (name, description, budget, date, address) */}
                    {/* State & City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                          {Object.keys(statesAndCitiesJSON).map((state) => (
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
                          value={projectData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={!projectData.state}
                        >
                          <option value="">Select City</option>
                          {projectData.state &&
                            statesAndCitiesJSON[projectData.state].map(
                              (city) => (
                                <option key={city} value={city}>
                                  {city}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>

                    {/* PDF Upload & Other fields */}
                    {/* Submit + Cancel with loading */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProjectForm(false);
                          setEditingProject(null);
                          setProjectData({
                            name: "",
                            description: "",
                            maxPrice: 10000,
                            estimatedDate: "",
                            address: "",
                            state: "",
                            city: "",
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
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && (
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                        )}
                        {editingProject ? "Update Project" : "Create Project"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Active Projects Section */}
        <section id="projects" className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Projects
            </h2>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-300"
                  >
                    {/* Project name header (3:7 ratio → use flex basis) */}
                    <div className="bg-gray-800 text-white px-4 py-3 flex items-center">
                      <h3 className="font-medium text-lg truncate flex-[3]">
                        {project.name}
                      </h3>
                      <span className="text-sm text-gray-300 flex-[7] text-right">
                        Expected:{" "}
                        {new Date(project.estimatedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Content part */}
                    <div className="p-4 flex flex-col space-y-3">
                      <p className="text-sm text-gray-700">
                        {truncateDescription(project.description)}
                      </p>

                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-blue-600">
                          ₹{project.maxPrice}
                        </span>
                        {project.pdfUrl && (
                          <button
                            onClick={() => handleDownloadPdf(project)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download PDF
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => fetchQuotations(project.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Quotations
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No active projects found.</p>
            )}
          </div>
        </section>

        {/* Previous Orders Section */}
        <section id="orders">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Previous Orders
            </h2>
            {completedOrders.length > 0 ? (
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
                        Quotation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Final Amount (₹)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {completedOrders.map((order) => (
                      <tr key={order.completedId}>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          <div className="font-semibold">
                            {order.projectName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {truncateDescription(
                              order.projectDescription || "",
                              60
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.makerName}</div>
                          <div className="text-xs text-gray-400">
                            {order.makerEmail}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          ₹{order.quotationAmount || "N/A"}
                          {order.quotationMessage && (
                            <div className="text-xs text-gray-400 italic">
                              "{truncateDescription(order.quotationMessage, 40)}
                              "
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.amount}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.completionDate).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
                          {order.report ? (
                            <a
                              href={order.report}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              View Report
                            </a>
                          ) : (
                            <span className="text-gray-400">No Report</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No completed orders found.</p>
            )}
          </div>
        </section>
      </main>

      {/* New Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProject ? "Edit Project" : "Create New Project"}
                </h2>
                <button
                  onClick={() => {
                    setShowProjectForm(false);
                    setEditingProject(null);
                    setProjectData({
                      name: "",
                      description: "",
                      maxPrice: 10000,
                      estimatedDate: "",
                      address: "",
                      state: "",
                      city: "",
                      pdf: null,
                    });
                    setPdfFileName("");
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
                >
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
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="maxPrice"
                  >
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={projectData.maxPrice}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="estimatedDate"
                  >
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    id="estimatedDate"
                    name="estimatedDate"
                    value={projectData.estimatedDate}
                    onChange={handleInputChange}
                    min={today}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      {Object.keys(statesAndCitiesJSON).map((state) => (
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
                      value={projectData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!projectData.state}
                    >
                      <option value="">Select City</option>
                      {projectData.state &&
                        statesAndCitiesJSON[projectData.state].map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Upload Project Specifications (PDF)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
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

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProject(null);
                      setProjectData({
                        name: "",
                        description: "",
                        maxPrice: 10000,
                        estimatedDate: "",
                        address: "",
                        state: "",
                        city: "",
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
                    disabled={isSubmitting}
                    className={`px-4 py-2 font-medium rounded-md transition duration-300 flex items-center justify-center ${
                      isSubmitting
                        ? "bg-blue-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : editingProject ? (
                      "Update Project"
                    ) : (
                      "Create Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotations Dialog */}
      {showQuotationsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Quotations for Project
                </h2>
                <button
                  onClick={() => setShowQuotationsDialog(false)}
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

              {quotations.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {quotations.map((quotation) => (
                    <div
                      key={quotation.quotation_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Quotation #{quotation.quotation_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Maker: {quotation.maker_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: {quotation.maker_email}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone: {quotation.maker_phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            Address: {quotation.maker_address}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          ₹{quotation.price}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {quotation.description}
                      </p>

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          Estimated completion:{" "}
                          {new Date(
                            quotation.estimated_date
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          Submitted:{" "}
                          {new Date(quotation.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        {quotation.pdf_quotation && (
                          <button
                            onClick={() =>
                              handleDownloadQuotationPdf(quotation)
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download Quotation PDF
                          </button>
                        )}
                        <button
                          onClick={() =>
                            acceptQuotation(quotation.quotation_id)
                          }
                          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-300"
                        >
                          Accept Quotation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No quotations found for this project yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default BuyerDashboard;
