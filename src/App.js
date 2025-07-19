import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EquipmentRentalPage from './pages/EquipmentRentalPage';
import CssBaseline from '@mui/material/CssBaseline';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/equipment-rental" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/equipment-rental" /> : <SignupPage />} />
      <Route path="/equipment-rental" element={<PrivateRoute><EquipmentRentalPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={user ? "/equipment-rental" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App; 