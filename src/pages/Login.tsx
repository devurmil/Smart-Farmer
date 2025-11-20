import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, Leaf, ArrowRight, Facebook, Twitter } from 'lucide-react';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { useUser } from '@/contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';
import RoleSelectionModal from '@/components/RoleSelectionModal';

// Import the image
import hero3 from '/design-assets/hero_3.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  
  const { isFacebookLoading, facebookLogin, isSDKLoaded } = useFacebookLogin();

  // Check if user needs role selection
  React.useEffect(() => {
    if (user && user.role_selection_pending) {
      setShowRoleSelection(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Real API call to backend
      const response = await fetch(`${getBackendUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data && data.success && data.data && data.data.user) {
        // Success - user logged in
        console.log('Login successful:', data);
        login(data.data.user, data.data.token);
        navigate('/');
      } else {
        // Error from backend or unexpected response
        const errorMsg = data && data.message ? data.message : 'Login failed: Unexpected response from server';
        console.error('Login failed:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 z-10"></div>
        <img 
          src={hero3} 
          alt="Smart Farming" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 z-20"></div>
        <div className="relative z-30 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Welcome to Smart Farm India
          </h1>
          <p className="text-xl text-green-100 max-w-md leading-relaxed">
            Join thousands of farmers who are already using our platform to increase productivity, 
            reduce costs, and make informed decisions for their farms.
          </p>
          <div className="mt-8 flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-green-100">Active Farmers</div>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-green-100">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your Smart Farm India account</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your email and password to access your farm dashboard
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="farmer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-base font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-gray-300 hover:bg-gray-50"
                    onClick={facebookLogin}
                    disabled={!isSDKLoaded || isFacebookLoading}
                  >
                    {isFacebookLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Facebook className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="ml-2">Facebook</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-gray-300 hover:bg-gray-50"
                  >
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <span className="ml-2">Google</span>
                  </Button>
                </div>
              </CardContent>
            </form>

            <CardFooter className="pt-6">
              <div className="w-full text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by farmers across India</p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                ))}
                <span className="text-sm text-gray-600 ml-2">4.9/5</span>
              </div>
              <div className="text-sm text-gray-500">•</div>
              <div className="text-sm text-gray-500">50,000+ users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal 
        isOpen={showRoleSelection} 
        onClose={() => setShowRoleSelection(false)} 
      />
    </div>
  );
};

export default Login;