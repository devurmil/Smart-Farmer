import { Calculator, Camera, DollarSign, Tractor, Newspaper, Store, BarChart3, Menu, Settings, Package } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUser } from "../contexts/UserContext";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems = [
  { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { name: "Area Calculator", icon: Calculator, href: "/calculator" },
  { name: "Disease Detection", icon: Camera, href: "#disease" },
  { name: "Cost Planning", icon: DollarSign, href: "/cost-planning" },
  { name: "Equipment Rental", icon: Tractor, href: "/equipment-rental" },
  { name: "Farm Supply", icon: Package, href: "/farm-supply" },
  { name: "News & Markets", icon: Newspaper, href: "#market-intelligence" },
  { name: "Suppliers", icon: Store, href: "/suppliers" }
];

const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user && user.role === 'admin';

  return (
    <aside
      className={cn(
        "bg-green-700 dark:bg-green-900 text-white h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-center border-b border-green-800 dark:border-green-950">
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md hover:bg-green-600 dark:hover:bg-green-800 transition-colors"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
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
                "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-white text-green-700 font-semibold"
                  : "hover:bg-green-600 dark:hover:bg-green-800 text-white",
                collapsed ? "justify-center" : ""
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-green-700" : "text-white")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Admin Logo above Settings (only for admin) */}
      {isAdmin && (
        <div className="p-2">
          <button
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-800 transition-colors w-full text-white",
              collapsed ? "justify-center" : ""
            )}
            onClick={() => navigate('/admin')}
          >
            <img src="/admin_logo.png" alt="Admin Logo" className="h-7 w-7 object-contain" />
            {!collapsed && <span>Admin</span>}
          </button>
        </div>
      )}

      {/* Settings Icon at the bottom */}
      <div className="p-2 border-t border-green-800 dark:border-green-950">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-800 transition-colors w-full text-white",
            collapsed ? "justify-center" : ""
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
