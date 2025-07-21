import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';

const roles = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'owner', label: 'Equipment Owner' },
  { value: 'supplier', label: 'Supplier' }
];

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/register', form);
      signup(res.data.data.user, res.data.data.token);
      navigate('/equipment-rental');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" align="center" gutterBottom>Sign Up</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required type="email" />
          <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required type="password" />
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
          <div style={{color:'red', fontWeight:'bold', marginBottom:8}}>TEST ROLE DROPDOWN</div>
          <TextField select label="Role" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal" required>
            {roles.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button onClick={() => navigate('/login')}>Already have an account? Log In</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupPage; 