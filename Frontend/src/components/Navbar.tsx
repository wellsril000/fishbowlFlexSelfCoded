import React from "react";
import { useNavigate } from "react-router-dom";
import { UserButton, useAuth } from "@clerk/clerk-react";
import logo from "../assets/fishbowl-logo.jpg";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const handleLogoClick = () => {
    if (isSignedIn) {
      navigate("/");
    } else {
      navigate("/sign-in");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full flex justify-between items-center py-4 bg-white shadow-sm z-50">
      {/* Left Side Logo and Text */}
      <button
        onClick={handleLogoClick}
        className="flex items-center space-x-2 ml-6 hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Fishbowl Flex Logo" className="h-8 w-8" />
        <h1 className="text-xl font-bold text-blue-600">Fishbowl Flex</h1>
      </button>

      {/* Right Side User Button (only show when signed in) */}
      {isSignedIn && (
        <div className="mr-6">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      )}
    </header>
  );
};

export default Navbar;
