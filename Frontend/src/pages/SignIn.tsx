import { SignIn } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center pt-20 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Fishbowl Flex
            </h1>
            <p className="text-gray-600">
              Sign in to access your projects and imports
            </p>
          </div>
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
