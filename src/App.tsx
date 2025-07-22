import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { UserProvider, useUser } from "./contexts/UserContext";

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
import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

const AppContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
    
    return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-auto">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
            <Route path="/disease" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
            <Route path="/cost-planning" element={<ProtectedRoute><CostPlanning /></ProtectedRoute>} />
            <Route path="/cost-planning/:cropName" element={<ProtectedRoute><CropDetail /></ProtectedRoute>} />
            <Route path="/market-intelligence" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
            <Route path="/equipment-rental" element={<ProtectedRoute><EquipmentRentalPage /></ProtectedRoute>} />
            <Route path="/farm-supply" element={<ProtectedRoute><FarmSupplyPage /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
