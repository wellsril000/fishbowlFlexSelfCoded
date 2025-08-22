import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// This is our FileUploadBox component
const FileUploadBox: React.FC = () => {
    // This is STATE - it remembers which file the user selected
    // useState creates a variable and a function to change it
    // selectedFile starts as null (no file selected)
    // setSelectedFile is the function we use to change selectedFile
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    // This is for navigation between pages
    const navigate = useNavigate();

    // This function checks if a file type is valid
    const isValidFileType = (file: File): boolean => {
        const validTypes = ['.csv', '.xlsx', '.xlsm'];
        const fileName = file.name.toLowerCase();

        // Check if the file name ends with any of our valid extensions
        return validTypes.some(type => fileName.endsWith(type));
    };

    // This function runs when the user selects a file
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        // event.target.files contains the file(s) the user selected
        const file = event.target.files?.[0]; // Get the first file (we only allow one)

        if (file) {
            // Check if the file type is valid
            if (isValidFileType(file)) {
                // File is valid - store it and prepare for navigation
                setSelectedFile(file);
                setError(null); // Clear any previous errors

                // Navigate to the preview page after a short delay
                // This gives the user visual feedback that their file was accepted
                setTimeout(() => {
                    navigate('/preview', { state: { file: file } });
                }, 500);
            } else {
                // File is invalid - show error and don't store the file
                setError('Please select a valid file type (.csv, .xlsx, or .xlsm)');
                setSelectedFile(null); // Clear any previously selected file
            }
        }
    };

    // This function runs when the user clicks the "Remove File" button
    const handleRemoveFile = () => {
        // Clear the selected file by setting it back to null
        setSelectedFile(null);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* This is the title of our upload box */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select a File to Upload
            </h3>

            {/* This is the file input - it's hidden but connected to our button */}
            <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept=".csv,.xlsx,.xlsm" // Only allow our valid file types
            />

            {/* This is our main upload button */}
            <label
                htmlFor="file-input"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg cursor-pointer text-center transition-colors"
            >
                Choose File
            </label>

            {/* This section shows the selected file (only if a file is selected) */}


            {/* This shows error messages */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">
                        {error}
                    </p>
                </div>
            )}

            {/* This shows when no file is selected and no error */}
            {!selectedFile && !error && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                    No file selected. Click "Choose File" to get started.
                </p>
            )}
        </div>
    );
};

export default FileUploadBox;
