require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const { connectDatabase } = require('./config/database');
const models = require('./models');
const usersRouter = require('./routes/users');
const equipmentRouter = require('./routes/equipment');
const suppliesRouter = require('./routes/supplies');
const farmsRouter = require('./routes/farms');
const diseaseRouter = require('./routes/disease');
const bookingRouter = require('./routes/booking');
const cropsRouter = require('./routes/crops');
const costPlanningRouter = require('./routes/cost-planning');
const maintenanceRouter = require('./routes/maintenance');
const authRouter = require('./routes/auth');

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
    origin: allowedOrigins,
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
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/supplies', suppliesRouter);
app.use('/api/farms', farmsRouter);
app.use('/api/disease', diseaseRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/cost-planning', costPlanningRouter);
app.use('/api/maintenance', maintenanceRouter);


// --- 4. Server Initialization ---

const PORT = process.env.PORT || 8000;

// Start server after database connection
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();
        console.log('✅ Database connection established');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            if (!process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
                console.warn('⚠️ WARNING: JWT_SECRET or FRONTEND_URL is not set in .env file. The application may not work as expected.');
            }
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();