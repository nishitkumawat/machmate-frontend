import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

function BuyerDashboard({ setIsAuthenticated, setUserRole }) {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [showQuotationsDialog, setShowQuotationsDialog] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
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
    pdf: null,
  });
  const [pdfFileName, setPdfFileName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();

  // Fetch projects and orders on component mount
  useEffect(() => {
    axios.get("http://localhost:8000/csrf/", { withCredentials: true });

    fetchProjects();
    fetchCompletedOrders();

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

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/buyer/projects/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/buyer/orders/completed/",
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );
      setCompletedOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch completed orders", error);
    }
  };

  const fetchQuotations = async (projectId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/buyer/projects/${projectId}/quotations/`,
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
        `http://localhost:8000/buyer/quotations/${quotationId}/accept/`,
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

  const handlePriceRangeChange = (min, max) => {
    setProjectData((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", projectData.name);
      formData.append("description", projectData.description);
      formData.append("minPrice", projectData.minPrice);
      formData.append("maxPrice", projectData.maxPrice);
      formData.append("estimatedDate", projectData.estimatedDate);
      formData.append("address", projectData.address);
      formData.append("country", projectData.country);
      formData.append("state", projectData.state);
      formData.append("city", projectData.city);

      if (projectData.pdf) {
        formData.append("pdf", projectData.pdf);
      }

      if (editingProject) {
        // Update existing project
        await axios.put(
          `http://localhost:8000/buyer/projects/${editingProject.id}/`,
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
        await axios.post(
          "http://localhost:8000/buyer/projects/create/",
          formData,
          {
            withCredentials: true,
            headers: {
              "X-CSRFToken": csrftoken,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setShowProjectForm(false);
      setEditingProject(null);
      setProjectData({
        name: "",
        description: "",
        minPrice: 0,
        maxPrice: 10000,
        estimatedDate: "",
        address: "",
        country: "",
        state: "",
        city: "",
        pdf: null,
      });
      setPdfFileName("");

      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error("Failed to save project", error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectData({
      name: project.name,
      description: project.description,
      minPrice: project.minPrice,
      maxPrice: project.maxPrice,
      estimatedDate: project.estimatedDate,
      address: project.address,
      country: project.country,
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

  const handleSwitchToMaker = () => {
    console.log("Switching to maker account");
    setShowSwitchDialog(false);
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
      // Get the CSRF token fresh each time, just like in other functions
      // const csrftoken = Cookies.get("csrftoken");

      await axios.delete(
        `http://localhost:8000/buyer/projects/${projectToDelete}/`,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
          },
        }
      );

      // Refresh projects list
      fetchProjects();
      setShowDeleteDialog(false);
      setProjectToDelete(null);
      alert("Project deleted successfully!");
    } catch (error) {
      console.error("Failed to delete project", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        handleLogout();
      } else if (error.response?.status === 403) {
      } else if (error.response?.status === 404) {
      } else {
      }
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.极速c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2极速4 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 极速724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 极速 3 3 0 016 0z"
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
                href="#projects"
                className={`px-3 py-2 font-medium ${
                  activeSection === "projects"
                    ? "极速blue-600"
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

            <div className="hidden md:flex items-center space极速x-2">
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
        <section id="dashboard" className="mb-12">
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
        </section>

        {/* Project List/Status Overview */}
        <section id="projects" className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Projects
            </h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">
                      {project.name}
                    </h3>

                    {/* Display truncated description */}
                    <p className="text-sm text-gray-600 mb-3">
                      {truncateDescription(project.description)}
                    </p>

                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">
                        ₹{project.minPrice} - ₹{project.maxPrice}
                      </span>
                      <span className="text-gray-500">
                        Expected:{" "}
                        {new Date(project.estimatedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {project.pdfUrl && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleDownloadPdf(project)}
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
                          Download PDF
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex justify-between">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit Project
                      </button>
                      <button
                        onClick={() => fetchQuotations(project.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Show Quotations
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
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
          <div className="bg-white rounded-xl shadow-md p-6">
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
                        {/* Project */}
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

                        {/* Maker */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.makerName}</div>
                          <div className="text-xs text-gray-400">
                            {order.makerEmail}
                          </div>
                        </td>

                        {/* Quotation */}
                        <td className="px-4 py-4 text-sm text-gray-500">
                          ₹{order.quotationAmount || "N/A"}
                          {order.quotationMessage && (
                            <div className="text-xs text-gray-400 italic">
                              "{truncateDescription(order.quotationMessage, 40)}
                              "
                            </div>
                          )}
                        </td>

                        {/* Final Price */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.amount}
                        </td>

                        {/* Completion Date */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.completionDate).toLocaleDateString()}
                        </td>

                        {/* Report */}
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
      </div>

      {/* New Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto relative">
            <div className="p-6">
              {/* Header with Close Button */}
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
                      minPrice: 0,
                      maxPrice: 10000,
                      estimatedDate: "",
                      address: "",
                      country: "",
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
                    view极速ox="0 0 24 24"
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
                    Budget Range (₹)
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">
                      ₹{projectData.minPrice}
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
                      ₹{projectData.maxPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span>₹50,000</span>
                    <span>₹100,000</span>
                  </div>
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

                {/* PDF Upload Field */}
                <div className="mb-6">
                  <label className="block text-gray-700极速text-sm font-medium mb-2">
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
                        minPrice: 0,
                        maxPrice: 10000,
                        estimatedDate: "",
                        address: "",
                        country: "",
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
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    {editingProject ? "Update Project" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Switch to Maker Dialog */}
      {showSwitchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                onClick={handleSwitchToMaker}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max极速md w-full p-6">
            <h2 className="text-xl极速font-bold text-gray-900 mb-4">
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
    </div>
  );
}

export default BuyerDashboard;
