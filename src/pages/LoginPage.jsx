import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Alert, FormControlLabel, Checkbox } from '@mui/material';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true); // Default to true for better UX
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const [showAdblockAlert, setShowAdblockAlert] = useState(true);

  useEffect(() => {
    const checkAdBlocker = () => {
      if (showAdblockAlert) {
        setShowAdblockAlert(false);
      }
    };
    checkAdBlocker();
    const interval = setInterval(checkAdBlocker, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/api/auth/login`, {
        ...form,
        rememberMe: rememberMe
      }, { withCredentials: true });
      
      // Force token storage in localStorage if Remember Me is checked
      if (rememberMe && res.data.data.token) {
        console.log('Remember Me enabled - storing token:', res.data.data.token ? 'Token present' : 'No token');
        localStorage.setItem('auth_token', res.data.data.token);
        // Also store user data for persistence
        localStorage.setItem('user_data', JSON.stringify(res.data.data.user));
      }
      
      login(res.data.data.user, res.data.data.token);
      navigate('/equipment-rental');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" align="center" gutterBottom>Log In</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required type="email" />
          <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required type="password" />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Remember me (Keep me logged in)"
            sx={{ mt: 1, mb: 1 }}
          />
          
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button onClick={() => navigate('/signup')}>Don't have an account? Sign Up</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; 