import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FileUploadBox from "../components/FileUploadBox";

const UploadPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const importType = location.state?.importType;
  const projectId = location.state?.projectId;

  // If no import type is selected, redirect to home
  if (!importType) {
    navigate("/");
    return null;
  }

  const getImportTypeInfo = (type: string) => {
    switch (type) {
      case "vendor":
        return {
          title: "Vendor Import",
          description:
            "Upload vendor information including contact details, payment terms, and supplier data.",
          color: "blue",
          icon: (
            <svg
              className="w-8 h-8 text-blue-600"
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
          ),
        };
      case "customer":
        return {
          title: "Customer Import",
          description:
            "Upload customer records with contact information, preferences, and account details.",
          color: "green",
          icon: (
            <svg
              className="w-8 h-8 text-green-600"
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
          ),
        };
      case "bom":
        return {
          title: "BOM Import",
          description:
            "Upload Bill of Materials with component lists, quantities, and assembly instructions.",
          color: "purple",
          icon: (
            <svg
              className="w-8 h-8 text-purple-600"
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
          ),
        };
      case "ppvp":
        return {
          title: "PPVP Import",
          description: "Upload PPVP data file for processing.",
          color: "orange",
          icon: (
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v12m6-6H6"
              />
            </svg>
          ),
        };
      default:
        return {
          title: "Import",
          description: "Upload your data file to get started.",
          color: "gray",
          icon: (
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          ),
        };
    }
  };

  const info = getImportTypeInfo(importType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 pt-20">
        {/* Header with Back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
            {info.title}
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Upload Your File
            </h3>
            <p className="text-gray-600">
              Supported formats: CSV, Excel (.xlsx, .xls, .xlsm)
            </p>
          </div>

          {/* Enhanced FileUploadBox */}
          <div className="max-w-2xl mx-auto">
            <FileUploadBox importType={importType} projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
