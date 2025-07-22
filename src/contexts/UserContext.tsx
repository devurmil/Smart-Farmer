import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
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

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('smartFarmUser');
    const savedToken = localStorage.getItem('smartFarmToken');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('smartFarmUser');
        localStorage.removeItem('smartFarmToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    localStorage.setItem('smartFarmUser', JSON.stringify(userData));
    
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('smartFarmToken', authToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartFarmUser');
    localStorage.removeItem('smartFarmToken');
    
    // Logout from Facebook if user was logged in via Facebook
    if (window.FB) {
      window.FB.logout();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      // Handle field mapping from backend to frontend
      const mappedUpdates = {
        ...updates,
        profilePicture: updates.profilePicture || (updates as any).profile_picture,
        loginMethod: updates.loginMethod || (updates as any).login_method,
      };
      
      const updatedUser = { ...user, ...mappedUpdates };
      setUser(updatedUser);
      localStorage.setItem('smartFarmUser', JSON.stringify(updatedUser));
    }
  };

  const value: UserContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
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