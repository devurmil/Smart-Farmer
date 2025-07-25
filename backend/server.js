require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const User = require('./models/User');
const models = require('./models');

const app = express();

// --- 1. Security and Middleware Configuration ---

// Use Helmet to set various security-related HTTP headers
app.use(helmet());

// CORS Configuration: This is crucial for cookie-based authentication
const allowedOrigins = [
    'http://localhost:8080', // Local frontend
    'https://smart-farmer-three.vercel.app' // Vercel deployed frontend
];

const corsOptions = {
    origin: (origin, callback) => {
        console.log('CORS request from origin:', origin); // <-- Log the origin for debugging
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    // This allows the browser to send cookies and other credentials
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// --- 2. Authentication Middleware ---

/**
 * Middleware to protect routes. It verifies the JWT from the cookie.
 */
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated: No token provided.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user data to the request object for use in other routes
        req.user = decoded;
        next();
    } catch (error) {
        // Clear the invalid cookie
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        return res.status(401).json({ message: 'Not authenticated: Invalid token.' });
    }
};

// --- 3. API Routes ---

const apiRouter = express.Router();

/**
 * [POST] /api/auth/login
 * Authenticates a user and sets a secure, HttpOnly cookie.
 */
apiRouter.post('/auth/login', async (req, res) => {
    const { email, password, login_method, provider_id } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // If login_method is 'email', check password
        if ((login_method === undefined || login_method === 'email')) {
            const valid = await user.comparePassword(password);
            if (!valid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            // For social login, check login_method matches and provider_id if needed
            if (user.login_method !== login_method) {
                return res.status(401).json({ message: 'Invalid social login method' });
            }
            // Optionally, check provider_id if you store it
        }
        // Prepare user payload for JWT (exclude password)
        const userPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            login_method: user.login_method,
            profile_picture: user.profile_picture,
            phone: user.phone,
        };
        // Create a JWT
        const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });
        // Set the token in a secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        });
        // Send back user data (without the token)
        res.status(200).json({ user: user.toJSON() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * [GET] /api/auth/me
 * This is the endpoint your frontend calls on startup to check for an active session.
 */
apiRouter.get('/auth/me', authMiddleware, (req, res) => {
    res.status(200).json({ success: true, data: { user: req.user } });
});

/**
 * [POST] /api/auth/logout
 * Clears the authentication cookie.
 */
apiRouter.post('/auth/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0), // Expire the cookie immediately
    });
    res.status(200).json({ message: 'Logged out successfully' });
});


/**
 * Example of a protected route.
 * Only authenticated users can access this.
 */
apiRouter.get('/protected-data', authMiddleware, (req, res) => {
    res.json({
        message: `Hello ${req.user.name}! This is protected data.`,
        user: req.user
    });
});

// Mount the API router under the /api path
app.use('/api', apiRouter);


// --- 4. Server Initialization ---

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
    try {
        await models.syncDatabase();
    } catch (err) {
        console.error('Database sync failed:', err);
    }
    console.log(`Server is running on port ${PORT}`);
    if (!process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
        console.warn('WARNING: JWT_SECRET or FRONTEND_URL is not set in .env file. The application may not work as expected.');
    }
});