
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Camera, DollarSign, Tractor, Newspaper, Store, Smartphone, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeatureGrid = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: "Farm Area Calculator",
      description: "Measure your land accurately using GPS and interactive maps",
      icon: Calculator,
      color: "bg-blue-50 text-blue-600",
      action: "Calculate Area",
      status: "Popular",
      href: "/calculator"
    },
    {
      title: "AI Disease Detection",
      description: "Identify crop diseases instantly using AI-powered image analysis",
      icon: Camera,
      color: "bg-red-50 text-red-600",
      action: "Scan Crop",
      status: "New",
      href: "/disease"
    },
    {
      title: "Cost Estimation",
      description: "Plan your farming budget with detailed cost breakdowns",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      action: "Plan Budget",
      status: null,
      href: "/cost-planning"
    },
    {
      title: "Equipment Rental",
      description: "Find and book tractors, harvesters, and other farm equipment",
      icon: Tractor,
      color: "bg-yellow-50 text-yellow-600",
      action: "Browse Equipment",
      status: null,
      href: "#equipment"
    },
    {
      title: "Market Intelligence",
      description: "Get real-time crop prices and market trends",
      icon: Newspaper,
      color: "bg-purple-50 text-purple-600",
      action: "View Prices",
      status: "Updated",
      href: "/market-intelligence"
    },
    {
      title: "Supplier Network",
      description: "Connect with verified suppliers for seeds, fertilizers, and tools",
      icon: Store,
      color: "bg-indigo-50 text-indigo-600",
      action: "Find Suppliers",
      status: null,
      href: "/suppliers"
    },
    {
      title: "IoT Monitoring",
      description: "Monitor soil, weather, and crop health with smart sensors",
      icon: Smartphone,
      color: "bg-teal-50 text-teal-600",
      action: "View Sensors",
      status: "Pro",
      href: "#iot"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {feature.status && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    feature.status === "New" ? "bg-green-100 text-green-700" :
                    feature.status === "Popular" ? "bg-blue-100 text-blue-700" :
                    feature.status === "Updated" ? "bg-purple-100 text-purple-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {feature.status}
                  </span>
                )}
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  if (feature.href.startsWith('/')) {
                    navigate(feature.href);
                  } else {
                    window.location.href = feature.href;
                  }
                }}
              >
                {feature.action}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FeatureGrid;
