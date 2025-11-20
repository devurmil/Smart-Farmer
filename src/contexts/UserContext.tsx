import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBackendUrl } from '@/lib/utils';

interface User {
  profile_picture?: string;
  profilePicture?: string;
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  loginMethod?: 'email' | 'facebook' | 'google';
  login_method?: 'email' | 'facebook' | 'google';
  role?: string;
  role_selection_pending?: boolean;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token?: string | null) => void;
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

const normalizeUser = (userData: User | null): User | null => {
  if (!userData) {
    return null;
  }

  const normalized: User = {
    ...userData,
    id: userData.id || userData._id,
    profilePicture: userData.profilePicture || userData.profile_picture,
    profile_picture: userData.profile_picture || userData.profilePicture,
    loginMethod: userData.loginMethod || userData.login_method || 'email',
    role_selection_pending:
      userData.role_selection_pending ??
      (userData as any).roleSelectionPending ??
      false,
  };

  return normalized;
};

const safeGetLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
};

const safeSetLocalStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    // no-op
  }
};

const safeRemoveLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (_) {
    // no-op
  }
};

const getStoredUser = (): User | null => {
  const storedUser = safeGetLocalStorage('user_data');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch (_) {
    safeRemoveLocalStorage('user_data');
    return null;
  }
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(normalizeUser(getStoredUser()));
  const [token, setToken] = useState<string | null>(safeGetLocalStorage('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const backendUrl = getBackendUrl() || 'http://localhost:5000';
        const storedToken = safeGetLocalStorage('auth_token');
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
          if (!token) {
            setToken(storedToken);
          }
        }

        const res = await fetch(`${backendUrl}/api/auth/me`, {
          credentials: 'include',
          headers,
        });
        let data: any = null;
        try {
          data = await res.json();
        } catch (_) {
          data = null;
        }

        if (res.ok && data?.success && data.data?.user) {
          const normalizedUser = normalizeUser(data.data.user);
          const responseToken = data?.data?.token;
          setUser(normalizedUser);
          if (normalizedUser) {
            safeSetLocalStorage('user_data', JSON.stringify(normalizedUser));
          }
          if (responseToken) {
            setToken(responseToken);
            safeSetLocalStorage('auth_token', responseToken);
          }
        } else if (res.status === 401) {
          setUser(null);
          setToken(null);
          safeRemoveLocalStorage('user_data');
          safeRemoveLocalStorage('auth_token');
        }
      } catch (err) {
        // On failure keep whatever we have locally
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (userData: User, authToken?: string | null) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    if (normalizedUser) {
      safeSetLocalStorage('user_data', JSON.stringify(normalizedUser));
    } else {
      safeRemoveLocalStorage('user_data');
    }

    if (typeof authToken !== 'undefined') {
      if (authToken) {
        setToken(authToken);
        safeSetLocalStorage('auth_token', authToken);
      } else {
        setToken(null);
        safeRemoveLocalStorage('auth_token');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeRemoveLocalStorage('user_data');
    safeRemoveLocalStorage('auth_token');
    const backendUrl = getBackendUrl() || 'https://smart-farmer-cyyz.onrender.com';
    fetch(`${backendUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    if (typeof window !== 'undefined' && (window as any).FB) {
      (window as any).FB.logout();
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
      safeSetLocalStorage('user_data', JSON.stringify(updatedUser));
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
