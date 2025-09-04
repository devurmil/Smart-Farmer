import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useToast } from "@/components/ui/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "@/components/Header";
import { UserProvider, useUser } from "./contexts/UserContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";

import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import DiseaseDetection from "./components/DiseaseDetection";
import CostPlanning from "./pages/CostPlanning";
import CropDetail from "./pages/CropDetail";
import MarketIntelligence from "./pages/MarketIntelligence";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EquipmentRentalPage from "./pages/EquipmentRentalPage";
import FarmSupplyPage from "./pages/FarmSupplyPage";
import Suppliers from "./pages/Suppliers";
import SupplierDashboard from "./components/SupplierDashboard";

import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import RoleSelectionModal from './components/RoleSelectionModal';
import TestDrawMap from './components/TestDrawMap';
import MaintenancePage from './pages/MaintenancePage';

const queryClient = new QueryClient();

const AppContent = () => {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { settings } = useSettings();
  const { user, isAuthenticated } = useUser();
  const location = useLocation();
  const isAdmin = user && user.role === 'admin';

  // Check if current route is a public route (login, signup, etc.)
  const isPublicRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Check if user needs role selection
  React.useEffect(() => {
    if (user && user.role_selection_pending) {
      setShowRoleSelection(true);
    }
  }, [user]);

  // Homepage Redirect Component - redirects to user's saved homepage
  const HomepageRedirect = () => {
    const homepagePath = settings.homepage;
    return <Navigate to={homepagePath} replace />;
  };

  // Protected Route Component - moved inside UserProvider
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useUser();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  // Role-based Route Component for restricting access
  const RoleBasedRoute = ({ 
    children, 
    allowedRoles = ['farmer', 'owner', 'admin'] 
  }: { 
    children: React.ReactNode;
    allowedRoles?: string[];
  }) => {
    const { user, isAuthenticated, isLoading } = useUser();
    const { toast } = useToast();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (!user || !allowedRoles.includes(user.role)) {
      // Show toast notification for restricted access
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: user?.role === 'owner' 
            ? "This page is not available for equipment owners. Please use the navigation menu to access available features."
            : "You don't have permission to access this page."
        });
      }, 100);
      
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  // Public Route Component - moved inside UserProvider
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useUser();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }
    
    return isAuthenticated ? <HomepageRedirect /> : <>{children}</>;
  };

  // If it's a public route, render without header
  if (isPublicRoute) {
    return (
      <div className="min-h-screen">
        <main className="w-full">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          </Routes>
        </main>

        {/* Role Selection Modal */}
        <RoleSelectionModal 
          isOpen={showRoleSelection} 
          onClose={() => setShowRoleSelection(false)} 
        />
      </div>
    );
  }

  // For authenticated routes, render with header
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><HomepageRedirect /></ProtectedRoute>} />
          
          {/* Farmer-only pages */}
          <Route path="/calculator" element={<RoleBasedRoute allowedRoles={['farmer']}><Calculator /></RoleBasedRoute>} />
          <Route path="/disease" element={<RoleBasedRoute allowedRoles={['farmer']}><DiseaseDetection /></RoleBasedRoute>} />
          <Route path="/cost-planning" element={<RoleBasedRoute allowedRoles={['farmer']}><CostPlanning /></RoleBasedRoute>} />
          <Route path="/cost-planning/:cropName" element={<RoleBasedRoute allowedRoles={['farmer']}><CropDetail /></RoleBasedRoute>} />
          
          {/* Shared pages (accessible by farmers, owners, and suppliers) */}
          <Route path="/farm-supply" element={<ProtectedRoute><FarmSupplyPage /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/supplier-dashboard" element={<ProtectedRoute><SupplierDashboard /></ProtectedRoute>} />
          <Route path="/market-intelligence" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
          <Route path="/equipment-rental" element={<ProtectedRoute><EquipmentRentalPage /></ProtectedRoute>} />
          
          {/* Owner-only pages */}
          <Route path="/maintenance" element={<RoleBasedRoute allowedRoles={['owner']}><MaintenancePage /></RoleBasedRoute>} />
          
          {/* Settings pages (accessible by all authenticated users) */}
          <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Admin-only pages */}
          <Route path="/admin" element={isAdmin ? <ProtectedRoute><AdminPage /></ProtectedRoute> : <Navigate to="/" replace />} />
          
          {/* Public pages */}
          <Route path="/test-draw" element={<TestDrawMap />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Role Selection Modal */}
      <RoleSelectionModal 
        isOpen={showRoleSelection} 
        onClose={() => setShowRoleSelection(false)} 
      />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <SettingsProvider>
            <UserProvider>
              <AppContent />
            </UserProvider>
          </SettingsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
