import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EquipmentRentalPage from './pages/EquipmentRentalPage';
import CssBaseline from '@mui/material/CssBaseline';
import { SettingsProvider } from './context/SettingsContext';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  // Use settings for homepage redirection
  const { settings } = React.useContext(require('./context/SettingsContext'));
  const homepage = settings?.homepage || '/';
  const isAdmin = user && user.email && user.email === import.meta.env.VITE_ADMIN_MAIL;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homepage} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={homepage} /> : <SignupPage />} />
      <Route path="/equipment-rental" element={<PrivateRoute><EquipmentRentalPage /></PrivateRoute>} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" />} />
      {/* Redirect root to default homepage */}
      <Route path="/" element={<Navigate to={homepage} />} />
      <Route path="*" element={<Navigate to={user ? homepage : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App; 