import React from "react";
import Navbar from "../components/Navbar";
import FileUploadBox from "../components/FileUploadBox";


const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col bg-gray-50">
            <Navbar />

            {/* Main content area - this is what scrolls */}
            <main className="flex-1 px-4 py-6 pt-20">
                <h2 className="text-2xl font-bold mt-6 text-center mb-1">
                    Welcome to Fishbowl Flex
                </h2>

                <h3 className="text-lg text-gray-600 text-center mb-6 mt-2">
                    Upload a file to get started
                </h3>

                {/* This is where we add our FileUploadBox component */}
                <FileUploadBox />
            </main>
        </div>
    );
};

export default HomePage;