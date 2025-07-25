import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EquipmentRentalPage from './pages/EquipmentRentalPage';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SettingsProvider, SettingsContext } from './context/SettingsContext';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  // Renaming `isAuthenticated` to `user` for clarity.
  // The main loading state is now handled by `AppRoutes`.
  const { isAuthenticated: user } = useUser();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  // Renaming `isAuthenticated` to `user` for clarity and adding the loading gate.
  const { isAuthenticated: user, isLoading } = useUser();
  // Use settings for homepage redirection
  const { settings } = React.useContext(SettingsContext);

  // This is the fix: a loading gate to prevent the UI flicker on refresh.
  if (isLoading) {
    // Display a centered spinner while the user session is being verified
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const homepage = settings?.homepage || '/';
  const isAdmin = user && user.email && user.email === import.meta.env.VITE_ADMIN_MAIL;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homepage} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={homepage} /> : <SignupPage />} />
      <Route path="/equipment-rental" element={<PrivateRoute><EquipmentRentalPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
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