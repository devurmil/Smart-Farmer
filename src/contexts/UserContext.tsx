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

  // On mount, fetch user from backend using cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
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
    // Also call backend to clear cookie
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
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