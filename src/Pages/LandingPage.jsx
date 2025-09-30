import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import machmateLogo from "../assets/logo-dark.png";

const API_HOST = import.meta.env.VITE_API_HOST;

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div
                className="flex-shrink-0 flex items-center"
                // onClick={() => navigate("/")}
              >
                <img
                  src={machmateLogo}
                  alt="MachMate Logo"
                  className="h-10 w-10 mr-2 object-contain"
                />

                <span className="text-xl font-bold text-blue-600">
                  MachMate
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#home"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                Features
              </a>

              <a
                href="/contact"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
              >
                Contact
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              >
                Sign Up
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#home"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium"
              >
                Contact
              </a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <button
                  className="w-full mb-2 px-4 py-2 text-blue-600 font-medium border border-blue-600 rounded-md"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Connect with <span className="text-blue-600">Machine Makers</span>{" "}
              Across the Country
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Revelat brings Work Seekers and Machine Owners together on one
              platform - post your machining requirement for free, get multiple
              verified quotations, and choose the best price and delivery.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
              <button
                className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition duration-300"
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md bg-blue-100 rounded-xl p-6 shadow-lg">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="bg-blue-600 py-3 px-4 text-white font-semibold">
                  <h3 className="text-lg">How It Works</h3>
                </div>
                <div className="p-4">
                  {/* Step 1 */}
                  <div className="flex items-start mb-6">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Post Your Machining Requirement
                      </h4>
                      <p className="text-sm text-gray-500">
                        Upload your drawing or job details in just a few clicks.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start mb-6">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-green-600">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Receive Multiple Quotations
                      </h4>
                      <p className="text-sm text-gray-500">
                        Get offers directly from verified Machine Owners.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-purple-600">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">Select the Best Quotation</h4>
                      <p className="text-sm text-gray-500">
                        Save time and cost by choosing the most suitable option.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          {/* Work Seekers */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            For <span className="text-blue-600">Work Seekers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20">
            {/* 0% Platform Fee */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🆓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                0% Platform Fee
              </h3>
              <p className="text-gray-600">
                Post your machining requirement free of cost—no hidden charges.
              </p>
            </div>

            {/* Easy Work Posting */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📌</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Easy Work Posting
              </h3>
              <p className="text-gray-600">
                Just describe your job and instantly reach a wide network of
                machine owners.
              </p>
            </div>

            {/* Multiple Quotations */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📑</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Multiple Quotations
              </h3>
              <p className="text-gray-600">
                Compare offers from different machine owners and choose the best
                fit.
              </p>
            </div>

            {/* Save Time & Money */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Save Time & Money
              </h3>
              <p className="text-gray-600">
                Quickly find the right partner, compare prices, and optimize
                costs.
              </p>
            </div>
          </div>

          {/* Machine Owners */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            For <span className="text-blue-600">Machine Owners</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20">
            {/* More Work Opportunities */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                More Work Opportunities
              </h3>
              <p className="text-gray-600">
                Access machining jobs from verified customers across industries.
              </p>
            </div>

            {/* Secure Payments */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Protected payment system ensures guaranteed payout for completed
                work.
              </p>
            </div>

            {/* Membership Benefits */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Membership Benefits
              </h3>
              <p className="text-gray-600">
                Premium features to grow visibility and get priority leads.
              </p>
            </div>

            {/* Dedicated Support */}
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Dedicated Support
              </h3>
              <p className="text-gray-600">
                Our team assists with payments, disputes, and smooth customer
                communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-blue-50 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Why Choose <span className="text-blue-600">MachMate</span>
          </h2>
          <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Our platform is designed to make custom manufacturing projects
            seamless and secure for both buyers and machine makers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Three-phase payment system protects both buyers and makers
                throughout the project lifecycle.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Big Network
              </h3>
              <p className="text-gray-600">
                Access machine makers from around the Country with various
                specializations and capabilities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Quality Assurance
              </h3>
              <p className="text-gray-600">
                Vetted manufacturers with verified reviews and quality control
                processes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Project Management
              </h3>
              <p className="text-gray-600">
                Tools to manage your project from start to finish with milestone
                tracking.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Membership Benefits
              </h3>
              <p className="text-gray-600">
                Discounts and premium features for members with tiered
                subscription plans.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Dedicated Support
              </h3>
              <p className="text-gray-600">
                Expert assistance throughout your project from our customer
                success team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Join thousands of buyers and machine makers on our platform today
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition duration-300 shadow-md"
              onClick={() => navigate("/signup")}
            >
              Sign Up as Buyer
            </button>
            <button
              className="px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              onClick={() => navigate("/signup")}
            >
              Sign Up as Maker
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
