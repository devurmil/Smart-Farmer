import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EquipmentRentalPage from './pages/EquipmentRentalPage';
import CssBaseline from '@mui/material/CssBaseline';
import { SettingsProvider } from './context/SettingsContext';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useUser();
  // Use settings for homepage redirection
  const { settings } = React.useContext(require('./context/SettingsContext'));
  const homepage = settings?.homepage || '/';
  const isAdmin = isAuthenticated && isAuthenticated.email && isAuthenticated.email === import.meta.env.VITE_ADMIN_MAIL;
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={homepage} /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={homepage} /> : <SignupPage />} />
      <Route path="/equipment-rental" element={<PrivateRoute><EquipmentRentalPage /></PrivateRoute>} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" />} />
      {/* Redirect root to default homepage */}
      <Route path="/" element={<Navigate to={homepage} />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? homepage : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <SettingsProvider>
      <UserProvider>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </SettingsProvider>
  );
}

export default App; 