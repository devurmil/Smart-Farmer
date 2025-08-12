import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {user?.role === 'owner' 
              ? "This page is not available for equipment owners. Please use the navigation menu to access available features."
              : "The page you're looking for doesn't exist or you don't have permission to access it."
            }
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
        
        {user?.role === 'owner' && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Available Pages for Equipment Owners:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Dashboard - View your equipment overview</li>
              <li>• Equipment Rental - Manage your equipment listings</li>
              <li>• News & Markets - Stay updated with market trends</li>
              <li>• Maintenance - Schedule and manage equipment maintenance</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
