import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ImportType: React.FC = () => {
  const navigate = useNavigate();

  const handleImportTypeSelect = (importType: string) => {
    console.log(`Selected import type: ${importType}`);
    // TODO: Navigate to the appropriate import configuration page
    // For now, just log the selection
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Header with Back and Next buttons */}
        <div className="flex items-center justify-between mb-8">
          {/* Back button on the left */}
          <button
            onClick={() => navigate("/preview")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back
          </button>

          {/* Title in the center */}
          <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
            Select an Import Type
          </h1>

          {/* Next button on the right (disabled until selection) */}
          <button
            onClick={() => handleImportTypeSelect("next")}
            disabled={true}
            className="bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Import Type Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Vendor Import */}
          <button
            onClick={() => handleImportTypeSelect("vendor")}
            className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 text-center group"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                Vendor
              </h3>
            </div>
          </button>

          {/* Customer Import */}
          <button
            onClick={() => handleImportTypeSelect("customer")}
            className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 p-6 text-center group"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                Customer
              </h3>
            </div>
          </button>

          {/* BOM Import */}
          <button
            onClick={() => handleImportTypeSelect("bom")}
            className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 p-6 text-center group"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                BOM
              </h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportType;
