import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Download,
  User,
  X,
} from "lucide-react";
import Footer from "./Footer.jsx";

const API_HOST = import.meta.env.VITE_API_HOST;

function ProjectDetail({ setIsAuthenticated, setUserRole }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuotationLoading, setIsQuotationLoading] = useState(false);
  const [quotationData, setQuotationData] = useState({
    amount: "",
    description: "",
    completionDate: "",
    pdf: null,
  });
  const [pdfFileName, setPdfFileName] = useState("");
  const [userQuotation, setUserQuotation] = useState(null);
  const [error, setError] = useState("");

  const csrftoken = Cookies.get("csrftoken");

  useEffect(() => {
    fetchProjectDetails();
    fetchUserSubscription();
    checkUserQuotation();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setError("");
      setIsLoading(true);

      // Try multiple possible endpoints
      let response;

      try {
        // First try the main endpoint
        response = await axios.get(`${API_HOST}/maker/products/${projectId}/`, {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        });
      } catch (firstError) {
        console.log("First endpoint failed, trying alternatives...");

        // Try alternative endpoints
        try {
          response = await axios.get(
            `${API_HOST}/maker/projects/${projectId}/`,
            {
              withCredentials: true,
              headers: { "X-CSRFToken": csrftoken },
            }
          );
        } catch (secondError) {
          // Try one more endpoint
          response = await axios.get(`${API_HOST}/api/projects/${projectId}/`, {
            withCredentials: true,
            headers: { "X-CSRFToken": csrftoken },
          });
        }
      }

      if (response.data) {
        console.log("Project data received:", response.data);
        setProject(response.data);
      } else {
        setError("Project not found or no data received");
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem("user");
        navigate("/login");
        return;
      } else if (error.response?.status === 404) {
        setError("Project not found");
      } else {
        setError("Failed to load project details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await axios.get(
        `${API_HOST}/subscriptions/user-subscription/`,
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

  const checkUserQuotation = async () => {
    try {
      const response = await axios.get(`${API_HOST}/maker/quotations/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      const userQuotations = response.data;
      const currentProjectQuotation = userQuotations.find(
        (q) => q.work_id === parseInt(projectId)
      );
      setUserQuotation(currentProjectQuotation || null);
    } catch (error) {
      console.error("Failed to fetch user quotations", error);
      setUserQuotation(null);
    }
  };

  const checkCredits = async () => {
    try {
      const response = await axios.get(
        `${API_HOST}/subscriptions/check-credits/`,
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
        `${API_HOST}/subscriptions/use-credit/`,
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );
      return response.data;
    } catch (error) {
      console.error("Use credit error:", error);
      throw error;
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
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          e.target.value = null;
          return;
        }
        setQuotationData((prev) => ({
          ...prev,
          pdf: file,
        }));
        setPdfFileName(file.name);
      } else {
        alert("Please select a PDF file");
        e.target.value = null;
      }
    }
  };

  const handleCreateQuotation = async () => {
    setIsQuotationLoading(true);
    try {
      const canSubmit = await checkCredits();
      if (!canSubmit) {
        alert(
          "No credits available. Please upgrade your subscription to submit quotations."
        );
        return;
      }
      setShowQuotationDialog(true);
    } catch (error) {
      alert("Failed to check credits. Please try again.");
    } finally {
      setIsQuotationLoading(false);
    }
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("amount", quotationData.amount);
      formData.append("description", quotationData.description);
      formData.append("completionDate", quotationData.completionDate);

      if (quotationData.pdf) {
        formData.append("pdf", quotationData.pdf);
      }

      const response = await axios.post(
        `${API_HOST}/maker/projects/${projectId}/quotation/`,
        formData,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        await useCredit();

        setShowQuotationDialog(false);
        setQuotationData({
          amount: "",
          description: "",
          completionDate: "",
          pdf: null,
        });
        setPdfFileName("");

        // Refresh data
        await Promise.all([checkUserQuotation(), fetchUserSubscription()]);

        alert("Quotation submitted successfully!");
      }
    } catch (error) {
      console.error("Failed to submit quotation", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit quotation. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await axios.delete(`${API_HOST}/maker/quotations/${quotationId}/`, {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        });

        setUserQuotation(null);
        alert("Quotation deleted successfully!");
      } catch (error) {
        console.error("Failed to delete quotation", error);
        alert("Failed to delete quotation. Please try again.");
      }
    }
  };

  const removePdfFile = () => {
    setQuotationData((prev) => ({
      ...prev,
      pdf: null,
    }));
    setPdfFileName("");
  };

  // Safe data access functions
  const getProjectPrice = () => {
    return (
      project?.price || project?.maxPrice || project?.estimated_price || "N/A"
    );
  };

  const getProjectDate = () => {
    const date =
      project?.estimated_date || project?.estimatedDate || project?.due_date;
    return date ? new Date(date).toLocaleDateString("en-GB") : "Not specified";
  };

  const getProjectLocation = () => {
    if (project?.city && project?.state) {
      return `${project.city}, ${project.state}`;
    }
    return project?.location || project?.address || "Location not specified";
  };

  const getProjectDescription = () => {
    return project?.description || "No description available";
  };

  const getQuotations = () => {
    return project?.quotations || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-blue-600 text-lg font-medium">
          Loading project details...
        </p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate("/maker-dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 text-lg font-medium mb-4">
            Project not found
          </p>
          <button
            onClick={() => navigate("/maker-dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const topQuotations = getQuotations().slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/maker-dashboard")}
                className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Project Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Project Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Project Name */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                >
                  {project.name || "Unnamed Project"}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 text-lg"
                >
                  {getProjectDescription()}
                </motion.p>
              </div>

              {/* Right Side - Project Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <IndianRupee className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      Estimated Price: ₹ {getProjectPrice()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      Due: {getProjectDate()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 text-red-600 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      {getProjectLocation()}
                    </span>
                  </div>
                </div>

                {project.pdf_report && (
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-purple-600 mr-2" />
                      <span className="text-lg font-semibold text-gray-900">
                        PDF Report Available
                      </span>
                    </div>
                    <a
                      href={project.pdf_report}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-purple-600 hover:text-purple-800"
                    >
                      <Download className="h-5 w-5 mr-1" />
                      Download
                    </a>
                  </div>
                )}

                {/* Add Quotation Button or User Quotation */}
                {!userQuotation ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateQuotation}
                    disabled={
                      (userSubscription && userSubscription.plan === "none") ||
                      isQuotationLoading
                    }
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition duration-300 ${
                      (userSubscription && userSubscription.plan === "none") ||
                      isQuotationLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isQuotationLoading ? (
                      "Checking Credits..."
                    ) : (
                      <>
                        <Plus className="h-5 w-5 inline mr-2" />
                        Add New Quotation
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          Your Quotation
                        </h3>
                        <p className="text-green-600">
                          Amount: ₹{" "}
                          {userQuotation.price || userQuotation.amount}
                        </p>
                        <p className="text-sm text-green-500">
                          Status: {userQuotation.status || "Submitted"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteQuotation(
                            userQuotation.quotation_id || userQuotation.id
                          )
                        }
                        className="flex items-center text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5 mr-1" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Project Description */}
          <div className="p-8 border-b border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Project Details
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {getProjectDescription()}
              </p>
            </motion.div>
          </div>

          {/* Top Quotations */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Top Quotations
              </h2>

              {topQuotations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No quotations submitted yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topQuotations.map((quotation, index) => (
                    <motion.div
                      key={quotation.id || index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="ml-3 text-lg font-semibold text-gray-900">
                            ₹ {quotation.amount || quotation.price || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            {quotation.vendor_company ||
                              quotation.vendor_name ||
                              quotation.vendorName ||
                              "Vendor"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Completion:{" "}
                            {new Date(
                              quotation.completion_date ||
                                quotation.estimated_date ||
                                new Date()
                            ).toLocaleDateString("en-GB")}
                          </span>
                        </div>

                        {quotation.description && (
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {quotation.description}
                          </p>
                        )}

                        {quotation.pdf_quotation && (
                          <a
                            href={quotation.pdf_quotation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Quotation PDF
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Quotation Dialog - Keep this part the same as your original */}
      {showQuotationDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          {/* ... Keep your existing quotation dialog code ... */}
        </motion.div>
      )}

      <Footer />
    </div>
  );
}

export default ProjectDetail;
