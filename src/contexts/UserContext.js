import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // The key fix: start isLoading as TRUE.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // The browser will automatically send the session cookie.
        // If the cookie is valid, this endpoint will return user data.
        // If not, it will return an error (e.g., 401), which will be caught.
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        // This is an expected outcome if the user is not logged in.
        console.log("No active session found. User is not logged in.");
        setUser(null);
      } finally {
        // We set loading to false regardless of whether the user is logged in or not.
        setIsLoading(false);
      }
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