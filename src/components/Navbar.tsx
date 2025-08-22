import React from "react";
import logo from "../assets/fishbowl-logo.jpg";

const Navbar: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 w-full flex justify-between items-center py-4 bg-white shadow-sm z-50">
            {/* Left Side Logo and Text */}
            <div className="flex items-center space-x-2 ml-6">
                <img src={logo} alt="Fishbowl Flex Logo" className="h-8 w-8" />
                <h1 className="text-xl font-bold text-blue-600">Fishbowl Flex</h1>
            </div>

        </header>
    );
};

export default Navbar;
