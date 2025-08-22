import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


const Preview: React.FC = () => {
    // Get the file data from navigation state
    const location = useLocation();
    const navigate = useNavigate();
    const file = location.state?.file;

    // State for our data and pagination
    const [data, setData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Number of rows to show per page
    const rowsPerPage = 100;

    // Function to read and parse the file
    const readFile = async (file: File) => {
        try {
            setIsLoading(true);
            setError(null);

            if (file.name.toLowerCase().endsWith('.csv')) {
                // Handle CSV files
                const text = await file.text();
                const lines = text.split('\n').filter(line => line.trim() !== '');

                if (lines.length === 0) {
                    throw new Error('File is empty');
                }

                // First line is headers
                const csvHeaders = lines[0].split(',').map(header => header.trim());
                setHeaders(csvHeaders);

                // Rest are data rows
                const csvData = lines.slice(1).map(line =>
                    line.split(',').map(cell => cell.trim())
                );

                setData(csvData);
                setTotalRows(csvData.length);
            } else {
                // Handle Excel files (.xlsx, .xlsm)
                // For now, we'll show a message that Excel support is coming
                setError('Excel file support is coming soon! For now, please use CSV files.');
                setData([]);
                setHeaders([]);
                setTotalRows(0);
            }
        } catch (err) {
            setError('Error reading file: ' + (err instanceof Error ? err.message : 'Unknown error'));
            setData([]);
            setHeaders([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Load file when component mounts
    useEffect(() => {
        if (file) {
            readFile(file);
        } else {
            // No file found, redirect back to home
            navigate('/');
        }
    }, [file, navigate]);

    // Calculate pagination values
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startRow = (currentPage - 1) * rowsPerPage + 1;
    const endRow = Math.min(currentPage * rowsPerPage, totalRows);
    const currentPageData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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
                            navigate('/');
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
                            // We'll add navigation logic here later
                            navigate('/ImportType');
                            console.log('Next button clicked!');
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
                            <span className="font-semibold text-gray-600">File Name:</span>
                            <p className="text-gray-800">{file?.name}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Total Rows:</span>
                            <p className="text-gray-800">{totalRows.toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Columns:</span>
                            <p className="text-gray-800">{headers.length}</p>
                        </div>
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
                                    Showing rows {startRow} to {endRow} of {totalRows.toLocaleString()}
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
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
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
                                                    {cell || '-'}
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