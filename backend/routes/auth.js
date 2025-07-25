const express = require('express');
const { User } = require('../models');
const { auth, generateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { auth: authMiddleware } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const router = express.Router();

const otpStore = {};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    // Check if phone is already used
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'User with this phone number already exists'
        });
      }
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      location,
      login_method: 'email',
      role
    });

    // Generate token
    const token = generateToken(user.id);

    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token // Include token for cross-origin fallback
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate token
    const token = generateToken(user.id);

    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token // Include token for cross-origin fallback
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.post('/facebook', async (req, res) => {
  try {
    const { name, email, facebookId, profilePicture } = req.body;

    if (!email || !facebookId) {
      return res.status(400).json({
        success: false,
        message: 'Email and Facebook ID are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update existing user
      await user.update({
        name: name || user.name,
        profile_picture: profilePicture || user.profile_picture,
        login_method: 'facebook',
        last_login: new Date()
      });
    } else {
      // Create new user
      user = await User.create({
        name: name || 'Facebook User',
        email,
        profile_picture: profilePicture,
        login_method: 'facebook',
        is_verified: true,
        last_login: new Date()
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Facebook login successful',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Facebook login'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { name, email, googleId, profilePicture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Email and Google ID are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update existing user
      await user.update({
        name: name || user.name,
        profile_picture: profilePicture || user.profile_picture,
        login_method: 'google',
        last_login: new Date()
      });
    } else {
      // Create new user
      user = await User.create({
        name: name || 'Google User',
        email,
        profile_picture: profilePicture,
        login_method: 'google',
        is_verified: true,
        last_login: new Date()
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (clear authentication cookie)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'No user found with this email' });
    // Generate reset token (valid for 1 hour)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    // Send email (configure SMTP in .env)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Reset Your Password',
      html: `<p>Hello ${user.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and new password are required' });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
});

// Request OTP for signup
router.post('/request-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // valid for 10 min
    // Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Smart Farm OTP',
      html: `<p>Hello${name ? ' ' + name : ''},</p><p>Your OTP for Smart Farm signup is: <b>${otp}</b></p><p>This code is valid for 10 minutes.</p>`
    });
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP request' });
  }
});

// Verify OTP and create user
router.post('/verify-otp', async (req, res) => {
  try {
    const { name, email, password, phone, role, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    const record = otpStore[email];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    // Remove OTP after use
    delete otpStore[email];
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      login_method: 'email',
      is_verified: true
    });
    const token = generateToken(user.id);
    
    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({ success: true, message: 'User created and verified', data: { user: user.toJSON() } });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
});

// Update user profile
router.put('/user/profile', authMiddleware, uploadProfileImage.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Check for unique email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    // Check for unique phone
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number already in use' });
      }
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (req.file && req.file.path) {
      user.profile_picture = req.file.path;
    }
    await user.save();
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
});

// Delete user profile (requires password)
router.delete('/user/profile', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!password || !(await user.comparePassword(password))) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    await user.destroy();
    res.json({ success: true, message: 'Profile deleted' });
  } catch (error) {
    console.error('Profile delete error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile delete' });
  }
});

module.exports = router;