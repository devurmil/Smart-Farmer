import { Home, Map, Microscope, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // Utility function for class merging (optional)

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/" },
    { label: "Calculator", icon: <Map className="h-5 w-5" />, path: "/calculator" },
    { label: "Disease Detection", icon: <Microscope className="h-5 w-5" />, path: "/disease" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "#" }
  ];

  return (
    <aside
      className={cn(
        "bg-green-900 text-white h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-center border-b border-green-800">
        <img
          src="/logo.png"
          alt="Logo"
          className={`transition-all duration-300 ${collapsed ? "w-8 h-8" : "w-12 h-12"}`}
        />
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

export default Sidebar;
