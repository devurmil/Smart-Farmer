# 🚀 Smart Farm Backend Setup Guide

## Quick Start Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
Your database configuration is already set in the root `.env` file:
- **Database:** farmbuddy
- **Host:** localhost:3306
- **User:** root

Make sure MySQL is running and execute the setup script:
```bash
mysql -u root -p < setup-database.sql
```

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### 4. Test the API
Visit: `http://localhost:5000/health`

You should see:
```json
{
  "success": true,
  "message": "Smart Farm API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 📋 Available Scripts

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 🔗 API Endpoints

### Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Farms
- `GET /farms` - Get user farms
- `POST /farms` - Create farm
- `GET /farms/:id` - Get farm details

### Crops
- `GET /crops` - Get user crops
- `POST /crops` - Create crop
- `GET /crops/types` - Available crop types

### Disease Detection
- `POST /disease/detect` - Upload image for detection
- `GET /disease/history` - Detection history

### Cost Planning
- `GET /cost-planning/crops` - Gujarat crop costs
- `POST /cost-planning/calculate` - Calculate costs

## 🔧 Configuration

All configuration is in the root `.env` file. Update these values as needed:

```env
# Optional: Add Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Add Weather API
WEATHER_API_KEY=your_openweather_api_key
```

## 🐛 Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Check database credentials in `.env`
3. Run the setup SQL script

### Port Already in Use
Change the PORT in `.env` file:
```env
PORT=5001
```

### CORS Issues
Update FRONTEND_URL in `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

## 📱 Frontend Integration

Update your frontend API calls to use:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

The backend is now ready to work with your existing React frontend!