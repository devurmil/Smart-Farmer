import { Calculator, Camera, DollarSign, Tractor, Newspaper, Store, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
}

const navigationItems = [
  { name: "Dashboard", icon: BarChart3, href: "/" },
  { name: "Area Calculator", icon: Calculator, href: "/calculator" },
  { name: "Disease Detection", icon: Camera, href: "/disease" },
  { name: "Cost Planning", icon: DollarSign, href: "/cost-planning" },
  { name: "Equipment Rental", icon: Tractor, href: "#equipment" },
  { name: "News & Markets", icon: Newspaper, href: "#news" },
  { name: "Suppliers", icon: Store, href: "#suppliers" }
];

const Sidebar = ({ collapsed }: SidebarProps) => {
  const { pathname } = useLocation();

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
    </aside>
  );
};

export default Sidebar;
