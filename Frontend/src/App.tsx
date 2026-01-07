import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import Preview from "./pages/preview";
import DataValidation from "./pages/DataValidation";
import SheetSelection from "./pages/SheetSelection";
import SignInPage from "./pages/SignIn";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectEdit from "./pages/ProjectEdit";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import ImportType from "./pages/ImportType";

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.warn(
    "VITE_CLERK_PUBLISHABLE_KEY is not set. Please add it to your .env file."
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey || ""}>
      <Router>
        <Routes>
          {/* Public route - sign in page */}
          <Route path="/sign-in" element={<SignInPage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <ProjectCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/edit"
            element={
              <ProtectedRoute>
                <ProjectEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sheet-selection"
            element={
              <ProtectedRoute>
                <SheetSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview"
            element={
              <ProtectedRoute>
                <Preview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-validation"
            element={
              <ProtectedRoute>
                <DataValidation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/importtype"
            element={
              <ProtectedRoute>
                <ImportType />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;
