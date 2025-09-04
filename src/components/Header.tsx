import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Menu, X, User, LogOut, Settings, Bell, ChevronDown, BarChart3, Calculator, Camera, DollarSign, Tractor, Package, Store, Newspaper, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'owner') {
      // Equipment owners only see relevant pages
      return [
        { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
        { name: "Equipment Rental", icon: Tractor, href: "/equipment-rental" },
        { name: "News & Markets", icon: Newspaper, href: "/market-intelligence" },
        { name: "Maintenance", icon: Wrench, href: "/maintenance" }
      ];
    } else if (user?.role === 'supplier') {
      // Suppliers see supply-related pages
      return [
        { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
        { name: "Farm Supply", icon: Package, href: "/farm-supply" },
        { name: "News & Markets", icon: Newspaper, href: "/market-intelligence" },
        { name: "Suppliers", icon: Store, href: "/suppliers" }
      ];
    } else {
      // Farmers see all pages
      return [
        { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
        { name: "Area Calculator", icon: Calculator, href: "/calculator" },
        { name: "Disease Detection", icon: Camera, href: "/disease" },
        { name: "Cost Planning", icon: DollarSign, href: "/cost-planning" },
        { name: "Equipment Rental", icon: Tractor, href: "/equipment-rental" },
        { name: "Farm Supply", icon: Package, href: "/farm-supply" },
        { name: "News & Markets", icon: Newspaper, href: "/market-intelligence" },
        { name: "Suppliers", icon: Store, href: "/suppliers" }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#d4ffe]/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-[#d4ffe]'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Smart Farm India</h1>
              <p className="text-xs text-green-600 font-medium">Digital Agriculture Solutions</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Main Navigation Items */}
            {navigationItems.slice(0, 4).map((item) => (
              <Link 
                key={item.name}
                to={item.href} 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href 
                    ? 'text-green-600' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* More Dropdown */}
            {navigationItems.length > 4 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium text-gray-700 hover:text-green-600">
                    More
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navigationItems.slice(4).map((item) => (
                    <DropdownMenuItem key={item.name} onClick={() => navigate(item.href)}>
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <User className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Settings Dropdown (if no more dropdown) */}
            {navigationItems.length <= 4 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium text-gray-700 hover:text-green-600">
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    General Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile-settings')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <User className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profile_picture} alt={user.name} />
                      <AvatarFallback className="bg-green-100 text-green-600 text-sm font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile-settings')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <User className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.href} 
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.href 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
              
              {/* Settings in mobile menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link 
                  to="/settings" 
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    location.pathname === '/settings' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <Link 
                  to="/profile-settings" 
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    location.pathname === '/profile-settings' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile Settings
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                      location.pathname === '/admin' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
