import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import machmateLogo from "../assets/machmate-dark.png";

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={machmateLogo}
                alt="MachMate Logo"
                className="h-10 w-10 mr-2 object-contain"
              />
              <span className="text-xl font-bold text-blue-600">MachMate</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/"
              className="text-gray-600 hover:text-blue-600 px-3 py-2 font-medium"
            >
              Home
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
                    d="M6 极速18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin极速="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space极速-y-1 sm:px-3">
            <a
              href="/"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium"
            >
              Home
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
  );
}

export default Navigation;
