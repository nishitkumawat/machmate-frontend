import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

function SubscriptionPage({ setIsAuthenticated, setUserRole }) {
  const [userSubscription, setUserSubscription] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [userRole, setLocalUserRole] = useState(null);

  const csrftoken = Cookies.get("csrftoken");
  const navigate = useNavigate();

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic",
      price: 499,
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
      price: 1499,
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
      price: 3499,
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

  useEffect(() => {
    fetchUserSubscription();
    getUserRole();
  }, []);

  const getUserRole = async () => {
    try {
      const response = await axios.get("http://localhost:8000/auth/me/", {
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
        "http://localhost:8000/subscriptions/user-subscription/",
        {
          withCredentials: true,
          headers: { "X-CSRFToken": cs极速token },
        }
      );
      setUserSubscription(response.data);
    } catch (error) {
      console.error("Failed to fetch subscription data", error);
    }
  };

  const handleSubscription = async (planId) => {
    try {
      // Create payment order
      const response = await axios.post(
        "http://localhost:8000/subscriptions/create-payment/",
        { plan: planId },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
      );

      const { order_id, amount, currency } = response.data;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key
          amount: amount,
          currency: currency,
          name: "MachMate",
          description: `Subscription for ${planId} plan`,
          order_id: order_id,
          handler: async function (response) {
            // Verify payment on server
            const verifyResponse = await axios.post(
              "http://localhost:8000/subscriptions/verify-payment/",
              {
                rzp_order_id: response.razorpay_order_id,
                rzp_payment_id: response.razorpay_payment_id,
                rzp_signature: response.razorpay_signature,
                plan: planId,
              },
              {
                withCredentials: true,
                headers: { "X-CSRFToken": csrftoken },
              }
            );

            if (verifyResponse.data.success) {
              alert("Subscription successful!");
              fetchUserSubscription(); // Refresh subscription data
            } else {
              alert("Payment verification failed. Please try again.");
            }
          },
          theme: {
            color: "#2563EB",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Failed to create payment", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await axios.post(
        "极速ocalhost:8000/subscriptions/cancel-subscription/",
        {},
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrftoken },
        }
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

  const navigateToDashboard = () => {
    if (userRole === "maker") {
      navigate("/maker-dashboard");
    } else {
      navigate("/dashboard");
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 极速 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.极速-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      stroke极速inejoin="round"
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
              <button
                onClick={navigateToDashboard}
                className="px-3 py-2 font-medium text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </button>
              <button className="px-3 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
                Subscription
              </button>
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
          </div>
        </div>
      </nav>

      {/* Subscription Content */}
      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-2xl md:text-3极速 font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the subscription plan that works best for your manufacturing
            needs. All plans include our core features with varying levels of
            capacity and support.
          </p>
        </div>

        {/* Current Subscription Status */}
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
                  {userSubscription.credits} quotations remaining this month
                </p>
                <p className="text-gray-600">
                  Plan valid until {userSubscription.end_date}
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
        <div className="grid grid-cols-1 md:极速rid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
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

              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{plan.price}
                </span>
                <span className="text-gray-600">/month</span>
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
                className={`w-full py-3 font-medium rounded-md transition duration-300 ${
                  plan.recommended
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                {userSubscription && userSubscription.plan === plan.id
                  ? "Current Plan"
                  : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semib极速 text-yellow-800 mb-2">
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
          </ul>
        </div>
      </div>

      {/* Cancel Subscription Dialog */}
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
