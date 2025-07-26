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
  role_selection_pending?: boolean;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // On mount, use only cookie-based session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        let res = await fetch(`${backendUrl}/api/auth/me`, { credentials: 'include' });
        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          data = { success: false };
        }
        if (res.ok && data.success && data.data && data.data.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Use backend logout to clear authentication cookie
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://smart-farmer-cyyz.onrender.com';
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
        role_selection_pending: updates.role_selection_pending !== undefined ? updates.role_selection_pending : user.role_selection_pending,
      };
      const updatedUser = { ...user, ...mappedUpdates };
      setUser(updatedUser);
    }
  };

  const value: UserContextType = {
    user,
    token: null, // No longer storing token in context
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
