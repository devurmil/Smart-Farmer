import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import DiseaseDetection from "./components/DiseaseDetection";
import CostPlanning from "./pages/CostPlanning";
import CropDetail from "./pages/CropDetail";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            {/* @ts-ignore */}
            <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-auto">
              {/* Header with toggle control */}
              <Header onMenuClick={() => setSidebarCollapsed((prev) => !prev)} />

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/disease" element={<DiseaseDetection />} />
                  <Route path="/cost-planning" element={<CostPlanning />} />
                  <Route path="/cost-planning/:cropName" element={<CropDetail />} />
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
