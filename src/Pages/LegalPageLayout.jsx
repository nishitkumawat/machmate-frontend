import React from "react";
import Navigation from "../Components/Navigation";
import Footer from "../Components/Footer";

const API_HOST = import.meta.env.VITE_API_HOST;

function LegalPageLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
      <Navigation />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            {title}
          </h1>

          <div className="prose max-w-none">{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default LegalPageLayout;
