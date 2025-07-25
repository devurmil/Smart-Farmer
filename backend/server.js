require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

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
    const { email, password } = req.body;

    // --- !!! IMPORTANT: Replace with your actual user validation logic !!! ---
    // Example: Find user in database and check password
    const userIsValid = (email === 'test@example.com' && password === 'password');
    if (!userIsValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const userPayload = { id: '123', email: 'test@example.com', name: 'Test User' };
    // --- End of placeholder logic ---

    // Create a JWT
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });

    // Set the token in a secure cookie
    res.cookie('token', token, {
        httpOnly: true, // The cookie is not accessible via client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict', // Helps mitigate CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Send back user data (without the token)
    res.status(200).json(userPayload);
});

/**
 * [GET] /api/auth/me
 * This is the endpoint your frontend calls on startup to check for an active session.
 */
apiRouter.get('/auth/me', authMiddleware, (req, res) => {
    // If authMiddleware passes, req.user will be populated.
    // We just send it back to the client.
    res.status(200).json(req.user);
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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (!process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
        console.warn('WARNING: JWT_SECRET or FRONTEND_URL is not set in .env file. The application may not work as expected.');
    }
});