
import Navigation from "@/components/Navigation";
import DashboardCards from "@/components/DashboardCards";
import FeatureGrid from "@/components/FeatureGrid";
import WeatherWidget from "@/components/WeatherWidget";
import RecentActivity from "@/components/RecentActivity";
import { useState } from "react";
import { X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for all devices */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-50 transition-transform duration-200 flex flex-col">
            <button
              className="self-end m-2 p-2 rounded hover:bg-accent text-muted-foreground"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <Navigation />
            </div>
          </div>
        </>
      )}
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.name || 'Dear Farmer'}! 🌾
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your farm today. Your wheat crop is looking healthy and you have 2 equipment bookings this week.
              </p>
            </div>
            <DashboardCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <WeatherWidget />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Smart Farming Tools
                </h2>
                <p className="text-muted-foreground">
                  Choose from our comprehensive suite of agricultural tools
                </p>
              </div>
              <FeatureGrid />
            </div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    🚀 Boost Your Farm Productivity
                  </h3>
                  <p className="text-green-100 mb-6">
                    Join thousands of farmers who have increased their yield by 25% and reduced costs by 30% using our smart farming platform.
                  </p>
                  <div className="flex space-x-4">
                    <button className="bg-card text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                      Upgrade to Pro
                    </button>
                    <button className="border border-green-300 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">₹45,230</div>
                  <div className="text-green-200">Average monthly savings</div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold">10,000+</div>
                      <div className="text-green-200">Happy Farmers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">25%</div>
                      <div className="text-green-200">Yield Increase</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
