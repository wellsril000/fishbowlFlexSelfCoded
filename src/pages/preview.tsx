import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
// Import xlsx for Excel file support
import * as XLSX from "xlsx";
// Import papaparse for robust CSV parsing
import Papa from "papaparse";

const Preview: React.FC = () => {
  // Get the file data from navigation state
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file;
  const selectedSheet = location.state?.selectedSheet;
  const workbook = location.state?.workbook;

  // State for our data and pagination
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Excel sheet information (passed from navigation state)
  // No need for local state since sheet is already selected

  // Number of rows to show per page
  const rowsPerPage = 100;

  // Parse CSV using Papaparse library
  const parseCSV = (
    csvText: string
  ): Promise<{ headers: string[]; data: string[][] }> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<string[]>) => {
          if (results.errors.length > 0) {
            console.warn("CSV parsing warnings:", results.errors);
          }

          if (results.data.length === 0) {
            reject(new Error("CSV file is empty"));
            return;
          }

          const headers = results.data[0];
          const data = results.data.slice(1);

          resolve({ headers, data });
        },
      });
    });
  };

  // Function to read and parse the file
  const readFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      if (file.name.toLowerCase().endsWith(".csv")) {
        // Handle CSV files with proper parsing
        const text = await file.text();
        const { headers: csvHeaders, data: csvData } = await parseCSV(text);

        setHeaders(csvHeaders);
        setData(csvData);
        setTotalRows(csvData.length);
      } else if (file.name.toLowerCase().match(/\.(xlsx|xls|xlsm)$/)) {
        // Handle Excel files - sheet should already be selected
        if (!selectedSheet || !workbook) {
          throw new Error(
            "Excel file data is incomplete. Please try uploading again."
          );
        }

        parseExcelSheet(workbook, selectedSheet);
      } else {
        setError(
          "Unsupported file type. Please use CSV or Excel files (.csv, .xlsx, .xls, .xlsm)"
        );
        setData([]);
        setHeaders([]);
        setTotalRows(0);
      }
    } catch (err) {
      setError(
        "Error reading file: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
      setData([]);
      setHeaders([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to parse a specific Excel sheet
  const parseExcelSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }

      // Get the range of cells that contain data
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

      if (range.e.r === 0 && range.e.c === 0) {
        throw new Error(`Sheet "${sheetName}" is empty`);
      }

      // Find the maximum number of columns used
      const maxCols = range.e.c + 1;

      // Parse headers (first row)
      const headers: string[] = [];
      for (let col = 0; col < maxCols; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        const headerValue = cell ? String(cell.v).trim() : `Column ${col + 1}`;
        headers.push(headerValue);
      }
      setHeaders(headers);

      // Parse data rows
      const excelData: string[][] = [];
      for (let row = 1; row <= range.e.r; row++) {
        const dataRow: string[] = [];
        for (let col = 0; col < maxCols; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          const cellValue = cell ? String(cell.v).trim() : "";
          dataRow.push(cellValue);
        }
        excelData.push(dataRow);
      }

      setData(excelData);
      setTotalRows(excelData.length);
    } catch (err) {
      throw new Error(
        `Error parsing sheet "${sheetName}": ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  // Load file when component mounts
  useEffect(() => {
    if (file) {
      readFile(file);
    } else {
      // No file found, redirect back to home
      navigate("/");
    }
  }, [file, navigate]);

  // Calculate pagination values
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);
  const currentPageData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Navigation functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 pt-20">
        {/* Header with Back button, title, and Next button */}
        <div className="flex items-center justify-between mb-6">
          {/* Back button on the left */}
          <button
            onClick={() => {
              // Navigate back to home page
              navigate("/");
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back
          </button>

          {/* Title in the center */}
          <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
            File Preview: {file?.name}
          </h1>

          {/* Next button on the right */}
          <button
            onClick={() => {
              navigate("/data-validation", {
                state: {
                  file: file,
                  importType: location.state?.importType,
                  selectedSheet: location.state?.selectedSheet,
                  workbook: location.state?.workbook,
                  data: data,
                  headers: headers,
                },
              });
              console.log("Next button clicked!");
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>

        {/* File Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Total Rows:</span>
              <p className="text-gray-800">{totalRows.toLocaleString()}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Columns:</span>
              <p className="text-gray-800">{headers.length}</p>
            </div>
            {selectedSheet ? (
              <div>
                <span className="font-semibold text-gray-600">
                  Excel Sheet:
                </span>
                <p className="text-gray-800">{selectedSheet}</p>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-gray-600">File Type:</span>
                <p className="text-gray-800">CSV</p>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Reading file...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && data.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Pagination Info */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing rows {startRow} to {endRow} of{" "}
                  {totalRows.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPageData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100"
                        >
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
