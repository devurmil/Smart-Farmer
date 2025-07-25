import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  profile_picture: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  loginMethod: 'email' | 'facebook' | 'google';
  role?: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, authToken?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to get user from cookies first, then fallback to localStorage token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // Always check for stored token first and set it if available
        const storedToken = localStorage.getItem('auth_token');
        console.log('UserContext: Stored token exists:', !!storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
        
        // First try cookie-based authentication
        console.log('UserContext: Trying cookie-based auth...');
        let res = await fetch(`${backendUrl}/api/auth/me`, { credentials: 'include' });
        console.log('UserContext: Cookie auth response status:', res.status);
        
        let data;
        try {
          data = await res.json();
          console.log('UserContext: Cookie auth response data:', data);
        } catch (parseError) {
          console.log('UserContext: Failed to parse cookie auth response as JSON');
          data = { success: false };
        }
        
        // If cookie auth fails, try token from localStorage
        if (!res.ok && storedToken) {
          console.log('UserContext: Cookie auth failed, trying token auth...');
          res = await fetch(`${backendUrl}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          console.log('UserContext: Token auth response status:', res.status);
          
          try {
            data = await res.json();
            console.log('UserContext: Token auth response data:', data);
          } catch (parseError) {
            console.log('UserContext: Failed to parse token auth response as JSON');
            data = { success: false };
          }
        }
        
        if (res.ok && data.success && data.data && data.data.user) {
          console.log('UserContext: Authentication successful, setting user:', data.data.user);
          setUser(data.data.user);
        } else {
          console.log('UserContext: Authentication failed, clearing user and token');
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_token');
        }
      } catch (err) {
        console.error('UserContext: Authentication error:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    // Also call backend to clear cookie
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    // Facebook logout if needed
    if (window.FB) {
      window.FB.logout();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const mappedUpdates = {
        ...updates,
        profilePicture: updates.profilePicture || (updates as any).profile_picture,
        loginMethod: updates.loginMethod || (updates as any).login_method,
      };
      const updatedUser = { ...user, ...mappedUpdates };
      setUser(updatedUser);
    }
  };

  const value: UserContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 