
import { Search, Bell, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleLogoClick = () => {
    navigate('/');
  };

  // Search data - all available tools and features
  const searchData = [
    { name: "Dashboard", href: "/", description: "Main dashboard with overview", category: "Main" },
    { name: "Farm Area Calculator", href: "/calculator", description: "Calculate farm area using GPS and maps", category: "Tools" },
    { name: "AI Disease Detection", href: "/disease", description: "Detect crop diseases using AI", category: "Tools" },
    { name: "Cost Planning", href: "#costs", description: "Plan farming budget and costs", category: "Planning" },
    { name: "Equipment Rental", href: "#equipment", description: "Rent tractors and farm equipment", category: "Services" },
    { name: "Market Intelligence", href: "#news", description: "Real-time crop prices and trends", category: "Market" },
    { name: "Supplier Network", href: "#suppliers", description: "Find verified suppliers", category: "Services" },
    { name: "IoT Monitoring", href: "#iot", description: "Monitor soil and weather sensors", category: "Monitoring" },
    { name: "Analytics Dashboard", href: "#analytics", description: "Farm performance insights", category: "Analytics" },
    { name: "Weather Widget", href: "#weather", description: "Current weather conditions", category: "Weather" },
    { name: "Recent Activity", href: "#activity", description: "View recent farm activities", category: "Activity" }
  ];

  // Filter search results
  const filteredResults = searchData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchClick = (href) => {
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      // For hash links, scroll to section or show message
      window.location.hash = href.substring(1);
    }
    setSearchQuery("");
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
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
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
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
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative" ref={searchRef}>
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
              className="pl-10 pr-10 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            
            {/* Search Results Dropdown */}
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
          
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
