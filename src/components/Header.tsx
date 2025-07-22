import { Search, Bell, User, X, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {}

const Header = ({}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const searchData = [
    { name: "Dashboard", href: "/", description: "Main dashboard with overview", category: "Main" },
    { name: "Farm Area Calculator", href: "/calculator", description: "Calculate farm area using GPS and maps", category: "Tools" },
    { name: "AI Disease Detection", href: "/disease", description: "Detect crop diseases using AI", category: "Tools" },
    { name: "Cost Planning", href: "/cost-planning", description: "Plan farming budget and costs", category: "Planning" },
    { name: "Equipment Rental", href: "#equipment", description: "Rent tractors and farm equipment", category: "Services" },
    { name: "Market Intelligence", href: "#news", description: "Real-time crop prices and trends", category: "Market" },
    { name: "Supplier Network", href: "#suppliers", description: "Find verified suppliers", category: "Services" },
    { name: "IoT Monitoring", href: "#iot", description: "Monitor soil and weather sensors", category: "Monitoring" },
    { name: "Analytics Dashboard", href: "#analytics", description: "Farm performance insights", category: "Analytics" },
    { name: "Weather Widget", href: "#weather", description: "Current weather conditions", category: "Weather" },
    { name: "Recent Activity", href: "#activity", description: "View recent farm activities", category: "Activity" }
  ];

  const filteredResults = searchData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.location.hash = href.substring(1);
    }
    setSearchQuery("");
    setShowResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Smart Farmer Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Smart Farmer</h1>
              <p className="text-xs text-gray-500">Assistant Platform</p>
            </div>
          </div>
        </div>
        {/* Desktop Search Bar (centered) */}
        {!isMobile && (
          <div className="relative mx-8 flex-1 max-w-xl" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tools, features, or services..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 0);
              }}
              onFocus={() => setShowResults(searchQuery.length > 0)}
              className="pl-10 pr-10 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ minWidth: 0 }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchClick(item.href)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Notification and User Icons (right) */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile-settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              title="Login to your account"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
        {/* Mobile Search Overlay */}
        {isMobile && mobileSearchOpen && (
          <div className="absolute left-0 right-0 top-full z-50 bg-white flex flex-col p-4 transition-all border-b border-gray-200 shadow-lg" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="flex items-center mb-4">
              <button onClick={() => setMobileSearchOpen(false)} className="mr-2">
                <X className="h-6 w-6 text-gray-600" />
              </button>
              <input
                autoFocus
                type="text"
                placeholder="Search tools, features, or services..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowResults(searchQuery.length > 0)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {showResults && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSearchClick(item.href);
                          setMobileSearchOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
