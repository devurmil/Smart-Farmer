import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // The key fix: start isLoading as TRUE.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      // The token is now automatically added to requests by the api.js interceptor,
      // so we just need to check if it exists in storage.
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // IMPORTANT: You must have this endpoint on your backend.
          // It should take a token and return the user object if valid.
          const response = await api.get('/auth/me'); // Example endpoint
          setUser(response.data);
        } catch (error) {
          // The token was invalid or expired. Clean up.
          console.error("Session validation failed. The token might be expired.", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }

      // Set loading to false only after the check is complete.
      setIsLoading(false);
    };

    validateSession();
  }, []); // The empty dependency array ensures this runs only once on app startup.

  const value = React.useMemo(() => ({
    isAuthenticated: user,
    setUser,
    isLoading,
  }), [user, isLoading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};