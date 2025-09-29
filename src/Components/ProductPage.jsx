import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  Trash2,
  Phone,
  Mail,
  Calendar,
  User,
  Crown,
  Image as ImageIcon,
} from "lucide-react";

const API_HOST = import.meta.env.VITE_API_HOST;

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [userQuotation, setUserQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [quotationData, setQuotationData] = useState({
    amount: "",
    description: "",
    completionDate: "",
    pdf: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const csrftoken = Cookies.get("csrftoken");

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`${API_HOST}/maker/products/${id}/`, {
        withCredentials: true,
      });
      setProduct(response.data);
      setQuotations(response.data.quotations || []);
      setUserQuotation(response.data.user_quotation || null);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch product details", error);
      setIsLoading(false);
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
    }
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("amount", quotationData.amount);
      formData.append("description", quotationData.description);
      formData.append("completionDate", quotationData.completionDate);
      if (quotationData.pdf) {
        formData.append("pdf", quotationData.pdf);
      }

      await axios.post(
        `${API_HOST}/maker/projects/${id}/quotation/`,
        formData,
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setShowQuotationForm(false);
      setQuotationData({
        amount: "",
        description: "",
        completionDate: "",
        pdf: null,
      });
      fetchProductDetails();
      alert("Quotation submitted successfully!");
    } catch (error) {
      console.error("Failed to submit quotation", error);
      alert("Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuotation = async () => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await axios.delete(
          `${API_HOST}/maker/quotations/${userQuotation.id}/`,
          {
            withCredentials: true,
            headers: { "X-CSRFToken": csrftoken },
          }
        );
        setUserQuotation(null);
        fetchProductDetails();
        alert("Quotation deleted successfully!");
      } catch (error) {
        console.error("Failed to delete quotation", error);
        alert("Failed to delete quotation. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const topQuotations = quotations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Product Header */}
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Image Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="w-full max-w-md h-80 bg-gray-100 rounded-lg shadow-md flex flex-col items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Product Image</p>
                  <p className="text-gray-400 text-sm mt-2">
                    No image available
                  </p>
                </div>
              </motion.div>

              {/* Right Side - Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Price */}
                <div>
                  <h3 className="text-2xl font-bold text-blue-600">
                    ₹ {product.price}
                  </h3>
                </div>

                {/* Estimated Date */}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>
                    Estimated Date:{" "}
                    {new Date(product.estimated_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Uploaded By */}
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3" />
                  <span>Uploaded by: {product.uploaded_by_name}</span>
                </div>

                {/* Contact Info for Premium Users */}
                {product.is_premium_user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="flex items-center mb-3">
                      <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-semibold text-yellow-800">
                        Premium User
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{product.phone_number}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{product.email}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quotation Action */}
                <div className="pt-4">
                  {userQuotation ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-green-800">
                            Your Quotation: ₹ {userQuotation.amount}
                          </h4>
                          <p className="text-green-700 text-sm mt-1">
                            Completion:{" "}
                            {new Date(
                              userQuotation.completion_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={handleDeleteQuotation}
                          className="flex items-center text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowQuotationForm(true)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                      Add Quotation
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 pt-6 border-t"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            {/* Top 3 Quotations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 pt-6 border-t"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Top Quotations
              </h3>
              {topQuotations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topQuotations.map((quotation, index) => (
                    <motion.div
                      key={quotation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-blue-600">
                          ₹ {quotation.amount}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {quotation.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {quotation.vendor_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Completion:{" "}
                        {new Date(
                          quotation.completion_date
                        ).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No quotations yet
                </p>
              )}
            </motion.div>

            {/* PDF Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-8 pt-6 border-t"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Documentation
              </h3>
              <div className="flex flex-wrap gap-4">
                {product.pdf_report && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    href={product.pdf_report}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Quotation Form Modal */}
      {showQuotationForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Add Quotation
              </h3>
              <form onSubmit={handleSubmitQuotation}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={quotationData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={quotationData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      name="completionDate"
                      value={quotationData.completionDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuotationForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default ProductPage;
