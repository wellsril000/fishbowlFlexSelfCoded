import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import { getProjects, type Project } from "../services/projects";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    location.state?.projectId || null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const token = await getToken();
      const data = await getProjects(token);
      setProjects(data);

      // If no project selected but we have projects, select the first one
      if (!selectedProjectId && data.length > 0) {
        setSelectedProjectId(data[0].id);
      }

      // Allow navigation without projects for testing
      if (data.length === 0) {
        navigate("/projects");
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      // TEMPORARILY DISABLED: Don't block on errors, allow testing
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleImportTypeSelect = (importType: string) => {
    // Allow navigation without project selection for testing
    if (!selectedProjectId) {
      alert("Please select a project first");
      return;
    }
    // Navigate to the upload page with the selected import type and project
    navigate("/upload", {
      state: { importType, projectId: selectedProjectId || null },
    });
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // TEMPORARILY DISABLED: Don't block UI on project loading
  if (isLoadingProjects) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 p-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Project Selector */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label
                htmlFor="project-select"
                className="text-sm font-medium text-gray-700"
              >
                Project:
              </label>
              <select
                id="project-select"
                value={selectedProjectId || ""}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate("/projects")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Manage Projects
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Select an Import Type to Get Started
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the type of data you want to import and we'll guide you
            through the process.
          </p>
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

          {/* PPVP */}
          <button
            onClick={() => handleImportTypeSelect("ppvp")}
            className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 p-6 text-center group"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                PPVP
              </h3>
            </div>
          </button>

          {/* Purchase Order (placeholder) */}
          <button className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 p-6 text-center group">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h10M7 11h6M7 15h4M5 5a2 2 0 012-2h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                Purchase Order
              </h3>
            </div>
          </button>

          {/* Sales Order (placeholder) */}
          <button className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 p-6 text-center group">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* Clipboard with pen icon */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3h6m-3-1v2M7 5h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 11h3m-3 4h2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.5 10.5l2.5-2.5 1.5 1.5-2.5 2.5-1.5.5.5-1.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                Sales Order
              </h3>
            </div>
          </button>

          {/* Add Inventory (placeholder) */}
          <button className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 p-6 text-center group">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4M3 7v10l9 4 9-4V7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                Add Inventory
              </h3>
            </div>
          </button>

          {/* Product Tree Categories (placeholder) */}
          <button className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200 p-6 text-center group">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h10M4 18h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">
                Product Tree Categories
              </h3>
            </div>
          </button>

          {/* Product Tree (placeholder) */}
          <button className="w-full h-32 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 p-6 text-center group">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v4m0 0l-3 3m3-3l3 3M6 13l-3 3 3 3m12-6l3 3-3 3M9 16h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                Product Tree
              </h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
