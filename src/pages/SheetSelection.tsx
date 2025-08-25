import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
// Import xlsx for Excel file support
import * as XLSX from "xlsx";

const SheetSelection: React.FC = () => {
  // Get the file data from navigation state
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file;

  // State for Excel sheet management
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to read and analyze the Excel file
  const analyzeExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if it's actually an Excel file
      if (!file.name.toLowerCase().match(/\.(xlsx|xls|xlsm)$/)) {
        throw new Error("This is not an Excel file");
      }

      // Read the file as binary data
      const arrayBuffer = await file.arrayBuffer();

      // Parse the Excel workbook
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get all sheet names
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length === 0) {
        throw new Error("No sheets found in Excel file");
      }

      if (sheetNames.length === 1) {
        // Only one sheet, automatically proceed to preview
        navigate("/preview", {
          state: {
            file: file,
            selectedSheet: sheetNames[0],
            workbook: workbook,
          },
        });
        return;
      }

      // Multiple sheets found - show selection interface
      setAvailableSheets(sheetNames);
      setSelectedSheet(sheetNames[0]); // Default to first sheet
    } catch (err) {
      setError(
        "Error reading Excel file: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle sheet selection
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  // Function to proceed to preview with selected sheet
  const handleNext = async () => {
    if (!selectedSheet) {
      setError("Please select a sheet to continue");
      return;
    }

    try {
      // Re-read the file to get the workbook data
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Navigate to preview with file, selected sheet, and workbook data
      navigate("/preview", {
        state: {
          file: file,
          selectedSheet: selectedSheet,
          workbook: workbook,
        },
      });
    } catch (err) {
      setError("Error preparing file for preview");
    }
  };

  // Load and analyze file when component mounts
  useEffect(() => {
    if (file) {
      analyzeExcelFile(file);
    } else {
      // No file found, redirect back to home
      navigate("/");
    }
  }, [file, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Header with Back and Next buttons */}
        <div className="flex items-center justify-between mb-8">
          {/* Back button on the left */}
          <button
            onClick={() => navigate("/")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back
          </button>

          {/* Title in the center */}
          <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
            Please select a sheet to import
          </h1>

          {/* Next button on the right */}
          <button
            onClick={handleNext}
            disabled={!selectedSheet}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>

        {/* File Information */}
        {/*
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              File: {file?.name}
            </h3>
            <p className="text-sm text-gray-600">
              {availableSheets.length} sheet
              {availableSheets.length !== 1 ? "s" : ""} detected
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing Excel file...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-600 text-center">{error}</p>
            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/")}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Sheet Selection Interface */}
        {!isLoading && !error && availableSheets.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {availableSheets.map((sheetName) => (
                <button
                  key={sheetName}
                  onClick={() => handleSheetSelect(sheetName)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedSheet === sheetName
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-lg font-medium">{sheetName}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SheetSelection;
