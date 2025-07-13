import { Home, Map, Microscope, Settings, Menu, DollarSign, Tractor, Newspaper, Store, Smartphone, BarChart3, Cloud, ActivitySquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // Utility function for class merging (optional)
import PropTypes from "prop-types";

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/" },
    { label: "Area Calculator", icon: <Map className="h-5 w-5" />, path: "/calculator" },
    { label: "Disease Detection", icon: <Microscope className="h-5 w-5" />, path: "/disease" },
    { label: "Cost Planning", icon: <DollarSign className="h-5 w-5" />, path: "#costs" },
    { label: "Equipment Rental", icon: <Tractor className="h-5 w-5" />, path: "#equipment" },
    { label: "News & Markets", icon: <Newspaper className="h-5 w-5" />, path: "#news" },
    { label: "Suppliers", icon: <Store className="h-5 w-5" />, path: "#suppliers" },
    { label: "IoT Monitoring", icon: <Smartphone className="h-5 w-5" />, path: "#iot" },
    { label: "Analytics Dashboard", icon: <BarChart3 className="h-5 w-5" />, path: "#analytics" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "#" }
  ];

  return (
    <aside
      className={cn(
        "bg-green-900 text-white h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center border-b border-green-800">
        <button
          onClick={onToggleCollapse}
          className="text-white hover:bg-green-800 rounded p-1 transition-all"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-green-800 transition-colors",
              pathname === item.path ? "bg-green-800 font-semibold" : "",
              collapsed ? "justify-center" : ""
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
};

export default Sidebar;
