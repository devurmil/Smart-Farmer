
import { Calculator, Camera, DollarSign, Tractor, Newspaper, Store, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

const navigationItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    href: "/",
    current: false
  },
  {
    name: "Area Calculator",
    icon: Calculator,
    href: "/calculator",
    current: false
  },
  {
    name: "Disease Detection",
    icon: Camera,
    href: "/disease",
    current: false
  },
  {
    name: "Cost Planning",
    icon: DollarSign,
    href: "#costs",
    current: false
  },
  {
    name: "Equipment Rental",
    icon: Tractor,
    href: "#equipment",
    current: false
  },
  {
    name: "News & Markets",
    icon: Newspaper,
    href: "#news",
    current: false
  },
  {
    name: "Suppliers",
    icon: Store,
    href: "#suppliers",
    current: false
  }
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </a>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <h3 className="text-sm font-semibold text-green-800 mb-2">🌱 Quick Tip</h3>
        <p className="text-xs text-green-700">
          Use the Area Calculator to measure irregular fields accurately and save multiple farm profiles for easy reference.
        </p>
      </div>
    </nav>
  );
};

export default Navigation;
