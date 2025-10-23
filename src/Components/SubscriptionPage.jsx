import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const API_HOST = import.meta.env.VITE_API_HOST;

function SubscriptionPage({ setIsAuthenticated, setUserRole }) {
  const [userSubscription, setUserSubscription] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [userRole, setLocalUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [selectedPeriods, setSelectedPeriods] = useState({});

  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic",
      features: [
        "10 quotations upload per month",
        "Standard listing in search results",
        "Basic customer support",
      ],
      recommended: false,
    },
    {
      id: "pro",
      name: "Pro",
      features: [
        "100 quotations upload per month",
        "Priority visibility in search",
        "Faster response times",
        "Dedicated customer support",
      ],
      recommended: true,
    },
    {
      id: "premium",
      name: "Premium",
      features: [
        "Unlimited quotations upload",
        "Highlighted quotations",
        "Top priority in search results",
        "24/7 premium support",
        "Early access to new features",
      ],
      recommended: false,
    },
  ];

  const billingPeriods = [
    { id: "1_month", name: "1 Month", months: 1 },
    { id: "3_months", name: "3 Months", months: 3, discount: "Save 5%" },
    { id: "6_months", name: "6 Months", months: 6, discount: "Save 10%" },
    { id: "12_months", name: "12 Months", months: 12, discount: "Save 15%" },
  ];

  const prices = {
    basic: {
      "1_month": 49900,
      "3_months": 142000,
      "6_months": 264000,
      "12_months": 479000,
    },
    pro: {
      "1_month": 149900,
      "3_months": 427000,
      "6_months": 790000,
      "12_months": 1439000,
    },
    premium: {
      "1_month": 349900,
      "3_months": 995000,
      "6_months": 1848000,
      "12_months": 3359000,
    },
  };

  useEffect(() => {
    fetchUserSubscription();
    getUserRole();

    // Initialize default selected periods
    const defaultPeriods = {};
    subscriptionPlans.forEach((plan) => {
      defaultPeriods[plan.id] = "1_month";
    });
    setSelectedPeriods(defaultPeriods);
  }, []);

  const getUserRole = async () => {
    try {
      const response = await axios.get(API_HOST + "/auth/me/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });
      if (response.data.isAuthenticated) {
        setLocalUserRole(response.data.role);
      }
    } catch (error) {
      console.error("Failed to fetch user role", error);
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

  const handlePeriodChange = (planId, periodId) => {
    setSelectedPeriods((prev) => ({
      ...prev,
      [planId]: periodId,
    }));
  };

  const calculateMonthlyPrice = (planId, periodId) => {
    const price = prices[planId][periodId];
    const months = billingPeriods.find((p) => p.id === periodId).months;
    return Math.round(price / months);
  };

  const calculateSavings = (planId, periodId) => {
    if (periodId === "1_month") return 0;
    const monthlyPrice = calculateMonthlyPrice(planId, periodId);
    const oneMonthPrice = prices[planId]["1_month"];
    const totalWithoutDiscount =
      oneMonthPrice * billingPeriods.find((p) => p.id === periodId).months;
    const actualTotal = prices[planId][periodId];
    return totalWithoutDiscount - actualTotal;
  };

  const handleSubscription = async (planId) => {
    if (isLoading) return;

    const periodId = selectedPeriods[planId];
    if (!periodId) {
      alert("Please select a billing period");
      return;
    }

    setLoadingPlan(planId);
    setIsLoading(true);

    try {
      // 1️⃣ Create payment order on backend
      const response = await axios.post(
        API_HOST + "/subscriptions/create-payment/",
        {
          plan: planId,
          period: periodId,
        },
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );

      const { order_id, amount, currency } = response.data;

      // 2️⃣ Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          if (document.getElementById("razorpay-script")) {
            // If script is already loading, wait for it
            const checkInterval = setInterval(() => {
              if (window.Razorpay) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            return;
          }

          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.id = "razorpay-script";
          script.onload = () => {
            console.log("Razorpay script loaded successfully");
            resolve();
          };
          script.onerror = () => {
            console.error("Failed to load Razorpay script");
            reject(new Error("Razorpay script failed to load"));
          };
          document.body.appendChild(script);
        });
      }

      // 3️⃣ Initialize Razorpay checkout
      const periodName = billingPeriods.find((p) => p.id === periodId).name;
      const options = {
        key: "rzp_live_RNKzs8FQpd6VDd", // Your Razorpay key
        amount: amount,
        currency: currency,
        name: "MachMate",
        description: `${planId} Plan - ${periodName}`,
        order_id: order_id,
        handler: async (razorpayResponse) => {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              API_HOST + "/subscriptions/verify-payment/",
              {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                plan: planId,
                period: periodId,
              },
              { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
            );

            if (verifyResponse.data.success) {
              alert("Subscription successful!");
              fetchUserSubscription();
            } else {
              alert("Payment verification failed. Please try again.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsLoading(false);
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Payment failed: ${err.response.data.error}`);
      } else {
        alert(
          "Payment system is currently unavailable. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await axios.post(
        API_HOST + "/subscriptions/cancel-subscription/",
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );

      alert(
        "Your subscription will be canceled at the end of the current billing period."
      );
      setShowCancelDialog(false);
      fetchUserSubscription();
    } catch (error) {
      console.error("Failed to cancel subscription", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        API_HOST + "/auth/logout/",
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrftoken } }
      );
    } catch (err) {
      console.error("Logout failed", err);
    }

    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/");
  };

  const navigateToDashboard = () => {
    if (userRole === "maker") navigate("/maker-dashboard");
    else navigate("/dashboard");
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  MachMate
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 py-2 font-medium text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </button>
              <button className="px-3 py-2 font-medium text-blue-600">
                Subscription
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => navigate("/makerprofile")}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
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

      {/* Subscription Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the subscription plan that works best for your manufacturing
            needs. Save more with longer commitments!
          </p>
        </div>

        {userSubscription && userSubscription.plan !== "none" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your Current Plan
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="text-lg font-medium text-blue-600 capitalize">
                  {userSubscription.plan} Plan
                </p>
                <p className="text-gray-600">
                  {userSubscription.remaining_credits} quotations remaining this
                  month
                </p>
                <p className="text-gray-600">
                  Plan valid until{" "}
                  {new Date(userSubscription.end_date).toLocaleDateString(
                    "en-GB"
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowCancelDialog(true)}
                className="mt-4 md:mt-0 px-4 py-2 border border-red-600 text-red-600 font-medium rounded-md hover:bg-red-50 transition duration-300"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => {
            const selectedPeriod = selectedPeriods[plan.id];
            const price = prices[plan.id][selectedPeriod];
            const months = billingPeriods.find(
              (p) => p.id === selectedPeriod
            ).months;
            const monthlyPrice = calculateMonthlyPrice(plan.id, selectedPeriod);
            const savings = calculateSavings(plan.id, selectedPeriod);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-md p-6 relative ${
                  plan.recommended
                    ? "ring-2 ring-blue-500 transform scale-105"
                    : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Billing Period Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Period
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) =>
                      handlePeriodChange(plan.id, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {billingPeriods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name}{" "}
                        {period.discount && `- ${period.discount}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Display */}
                <div className="mb-4">
                  <div className="flex items-baseline mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{(price / 100).toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">
                      for {months} month{months > 1 ? "s" : ""}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 line-through">
                        ₹
                        {(
                          (prices[plan.id]["1_month"] * months) /
                          100
                        ).toLocaleString()}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        Save ₹{(savings / 100).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    ₹{(monthlyPrice / 100).toLocaleString()} per month
                  </div>
                </div>

                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscription(plan.id)}
                  disabled={
                    isLoading ||
                    (userSubscription && userSubscription.plan === plan.id)
                  }
                  className={`w-full py-3 font-medium rounded-md transition duration-300 ${
                    userSubscription && userSubscription.plan === plan.id
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : plan.recommended
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {isLoading && loadingPlan === plan.id
                    ? "Processing..."
                    : userSubscription && userSubscription.plan === plan.id
                    ? "Current Plan"
                    : "Subscribe Now"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Important Information
          </h3>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            <li>
              Once payment is completed, the plan cannot be canceled for the
              current billing period.
            </li>
            <li>
              You can cancel your subscription for the next billing cycle from
              your profile settings.
            </li>
            <li>Plan refunds are not available after payment processing.</li>
            <li>Unused quotations do not roll over to the next month.</li>
            <li>
              Longer subscriptions offer better value with discounted rates.
            </li>
          </ul>
        </div>
      </div>

      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Subscription
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You will still
              have access to your current plan features until the end of your
              billing period.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition duration-300"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPage;
