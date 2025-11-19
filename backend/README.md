# Smart Farm India - Backend API

A comprehensive backend API for the Smart Farm India application, built with Node.js, Express.js, and MongoDB (Mongoose).

## 🚀 Features

- **User Authentication** - JWT-based auth with email, Facebook, and Google login
- **Farm Management** - Create and manage multiple farms
- **Crop Tracking** - Track crop lifecycle from planting to harvest
- **Disease Detection** - AI-powered disease detection with treatment recommendations
- **Cost Planning** - Detailed cost analysis for Gujarat's major crops
- **Weather Integration** - Weather data storage and retrieval
- **File Upload** - Cloudinary integration for image storage
- **Security** - Rate limiting, CORS, helmet, and input validation

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (local server or MongoDB Atlas cluster)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   MONGO_URL=mongodb://localhost:27017/smart_farmer
   # For MongoDB Atlas use:
   # MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_farmer

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Gmail API (used for OTP emails)
   GOOGLE_EMAIL=your_gmail@example.com
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token
   GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground

   # Weather API Configuration
   WEATHER_API_KEY=your_openweather_api_key

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   
   - Install and start MongoDB locally (`brew services start mongodb-community` on macOS or run `mongod` manually), **or**
   - Create a MongoDB Atlas cluster and whitelist your IP / Render region.
   - Update `MONGO_URL` with the connection string.

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/facebook` | Facebook OAuth | Public |
| POST | `/auth/google` | Google OAuth | Public |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/logout` | Logout user | Private |

### Farm Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/farms` | Get all user farms | Private |
| GET | `/farms/:id` | Get specific farm | Private |
| POST | `/farms` | Create new farm | Private |
| PUT | `/farms/:id` | Update farm | Private |
| DELETE | `/farms/:id` | Delete farm | Private |
| GET | `/farms/:id/dashboard` | Get farm dashboard | Private |

### Crop Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/crops` | Get all user crops | Private |
| GET | `/crops/:id` | Get specific crop | Private |
| POST | `/crops` | Create new crop | Private |
| PUT | `/crops/:id` | Update crop | Private |
| DELETE | `/crops/:id` | Delete crop | Private |
| GET | `/crops/types` | Get available crop types | Public |
| GET | `/crops/:id/timeline` | Get crop timeline | Private |

### Disease Detection

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/disease/detect` | Detect disease from image | Private |
| GET | `/disease/history` | Get detection history | Private |
| GET | `/disease/treatments/:disease` | Get treatment info | Public |
| PUT | `/disease/:id/treatment` | Update treatment status | Private |

### Cost Planning

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/cost-planning/crops` | Get crops with cost info | Public |
| POST | `/cost-planning/calculate` | Calculate crop costs | Private |
| GET | `/cost-planning/history` | Get cost planning history | Private |
| GET | `/cost-planning/:id` | Get specific cost plan | Private |
| DELETE | `/cost-planning/:id` | Delete cost plan | Private |

## 🗄️ Data Models

The backend uses Mongoose schemas located in `backend/models`. Key models include:

- `User` – authentication, profile, roles
- `Farm`, `Crop`, `Equipment`, `Maintenance` – core farm resources
- `Supply`, `SupplyOrder` – supplier marketplace
- `Booking` – equipment booking with live status stream
- `DiseaseDetection`, `WeatherData`, `CostPlan` – analytics datasets

Each schema defines its relationships and indexes; refer to the files for exact fields.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string (local or Atlas) | Yes |
| `JWT_SECRET` | JWT secret key | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No |
| `GOOGLE_EMAIL` | Gmail sender for OTP email | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth refresh token | Yes |
| `PORT` | Server port | No |
| `NODE_ENV` | Environment | No |
| `CLOUDINARY_*` | Cloudinary credentials | Optional |
| `WEATHER_API_KEY` | OpenWeather API key | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## 🚦 Running Tests

```bash
npm test
```

## 📦 Deployment

### Using PM2 (Recommended)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Start the application**
   ```bash
   pm2 start server.js --name "smart-farm-api"
   ```

3. **Monitor the application**
   ```bash
   pm2 monit
   ```

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t smart-farm-api .
   docker run -p 5000:5000 smart-farm-api
   ```

## 🔒 Security Features

- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configurable cross-origin requests
- **Helmet** - Sets various HTTP headers for security
- **Input Validation** - Joi-based request validation
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **Query Sanitization** - Mongoose schema validation and sanitization

## 📊 Monitoring

### Health Check
```bash
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Smart Farm API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@smartfarmindia.com or create an issue in the repository.