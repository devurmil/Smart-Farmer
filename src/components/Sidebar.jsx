import { useState } from "react";
import { Calculator, Camera, DollarSign, Tractor, Newspaper, Store, BarChart3, Settings, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", icon: BarChart3, href: "/" },
  { name: "Area Calculator", icon: Calculator, href: "/calculator" },
  { name: "Disease Detection", icon: Camera, href: "/disease" },
  { name: "Cost Planning", icon: DollarSign, href: "/cost-planning" },
  { name: "Equipment Rental", icon: Tractor, href: "#equipment" },
  { name: "News & Markets", icon: Newspaper, href: "#news" },
  { name: "Suppliers", icon: Store, href: "#suppliers" }
];

const Sidebar = ({ collapsed: collapsedProp, onToggleCollapse }) => {
  // Support both controlled and uncontrolled collapse
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp !== undefined ? collapsedProp : internalCollapsed;
  const { pathname } = useLocation();

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <aside
      className={cn(
        "bg-green-900 text-white h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center border-b border-green-800">
        <button
          onClick={handleToggle}
          className="text-white hover:bg-green-800 rounded p-1 transition-all mr-2"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </button>
        {!collapsed && (
          <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 ml-2"
          />
        )}
        {collapsed && (
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 ml-2"
          />
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-green-800 transition-colors",
                isActive ? "bg-green-800 font-semibold" : "",
                collapsed ? "justify-center" : ""
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-800 flex items-center justify-center">
        <Link to="/settings" className="text-white hover:text-green-300">
          <Settings className="h-6 w-6" />
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
