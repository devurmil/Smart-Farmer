const express = require('express');
const { User } = require('../models');
const { auth, generateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { auth: authMiddleware } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');
const router = express.Router();

const otpStore = {};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    // Check if phone is already used
    if (phone) {
      const existingPhone = await User.findOne({ phone });
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
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
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
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
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
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    // Always set secure cookie so cross-origin requests include auth
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      path: '/',
    });
    console.log(
      `Login: Cookie set (rememberMe ${rememberMe ? 'enabled - 30d' : 'disabled - 7d'})`
    );

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

    console.log('Facebook login attempt:', { name, email, facebookId, profilePicture });

    // Check if user exists by email or facebook_id
    let user = await User.findOne({ 
      $or: [
        { email },
        { facebook_id: facebookId }
      ]
    });

    if (user) {
      // Update existing user
      user = await User.findByIdAndUpdate(
        user._id,
        {
          name: name || user.name,
          profile_picture: profilePicture || user.profile_picture,
          facebook_id: facebookId,
          login_method: 'facebook',
          last_login: new Date()
        },
        { new: true }
      );
      console.log('Updated existing user:', user.id);
    } else {
      // Create new user with role selection pending
      user = await User.create({
        name: name || 'Facebook User',
        email,
        facebook_id: facebookId,
        profile_picture: profilePicture,
        login_method: 'facebook',
        is_verified: true,
        last_login: new Date(),
        role_selection_pending: true, // Mark as needing role selection
        role: null // Set role to null initially
      });
      console.log('Created new user with pending role selection:', user.id);
    }

    // Generate token
    const token = generateToken(user.id);

    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    console.log('Facebook login successful for user:', user.id);

    res.json({
      success: true,
      message: user.role_selection_pending ? 'Facebook login successful. Please select your role.' : 'Facebook login successful',
      data: {
        user: user.toJSON(),
        requiresRoleSelection: user.role_selection_pending
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

    console.log('Google login attempt:', { name, email, googleId, profilePicture });

    // Check if user exists by email or google_id
    let user = await User.findOne({ 
      $or: [
        { email },
        { google_id: googleId }
      ]
    });

    if (user) {
      // Update existing user
      user = await User.findByIdAndUpdate(
        user._id,
        {
          name: name || user.name,
          profile_picture: profilePicture || user.profile_picture,
          google_id: googleId,
          login_method: 'google',
          last_login: new Date()
        },
        { new: true }
      );
      console.log('Updated existing user:', user.id);
    } else {
      // Create new user with role selection pending
      user = await User.create({
        name: name || 'Google User',
        email,
        google_id: googleId,
        profile_picture: profilePicture,
        login_method: 'google',
        is_verified: true,
        last_login: new Date(),
        role_selection_pending: true, // Mark as needing role selection
        role: null // Set role to null initially
      });
      console.log('Created new user with pending role selection:', user.id);
    }

    // Generate token
    const token = generateToken(user.id);

    // Set token as HTTP-only cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    console.log('Google login successful for user:', user.id);

    res.json({
      success: true,
      message: user.role_selection_pending ? 'Google login successful. Please select your role.' : 'Google login successful',
      data: {
        user: user.toJSON(),
        requiresRoleSelection: user.role_selection_pending
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
      secure: true,
      sameSite: 'none',
      path: '/',
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

// @route   POST /api/auth/force-logout
// @desc    Force logout - clear all authentication without requiring auth
// @access  Public
router.post('/force-logout', async (req, res) => {
  try {
    // Clear the authentication cookie aggressively
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    
    // Also try clearing with different paths
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    
    console.log('Force logout - cookies cleared');
    
    res.json({
      success: true,
      message: 'Force logout successful - all authentication cleared'
    });
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during force logout'
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user found with this email' });
    // Generate reset token (valid for 1 hour)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl
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
    const user = await User.findById(payload.id).select('+password');
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
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // valid for 10 min
    await sendOtpEmail({ email, otp, name });
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
    const existingUser = await User.findOne({ email });
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
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
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
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Check for unique email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    // Check for unique phone
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
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
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!password || !(await user.comparePassword(password))) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Profile deleted' });
  } catch (error) {
    console.error('Profile delete error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile delete' });
  }
});

// @route   POST /api/auth/select-role
// @desc    Select role for social login users
// @access  Private
router.post('/select-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['farmer', 'owner', 'supplier'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (farmer, owner, or supplier)'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.role_selection_pending) {
      return res.status(400).json({
        success: false,
        message: 'Role selection is not pending for this user'
      });
    }

    // Update user with selected role
    await User.findByIdAndUpdate(user._id, {
      role,
      role_selection_pending: false
    }, { new: true });
    
    const updatedUser = await User.findById(user._id);

    console.log('Role selected for user:', user.id, 'Role:', role);

    res.json({
      success: true,
      message: 'Role selected successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Role selection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during role selection'
    });
  }
});

module.exports = router;