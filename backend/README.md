# Smart Farm India - Backend API

A comprehensive backend API for the Smart Farm India application, built with Node.js, Express.js, and MySQL.

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

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
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
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=smart_farm_db
   DB_USER=root
   DB_PASSWORD=your_password

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

   # Weather API Configuration
   WEATHER_API_KEY=your_openweather_api_key

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   
   Create a MySQL database:
   ```sql
   CREATE DATABASE smart_farm_db;
   ```

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

## 🗄️ Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, Unique)
- password (VARCHAR, Hashed)
- profile_picture (TEXT)
- login_method (ENUM: email, facebook, google)
- is_verified (BOOLEAN)
- phone (VARCHAR)
- location (JSON)
- last_login (DATETIME)
- created_at, updated_at (TIMESTAMPS)
```

### Farms Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (VARCHAR)
- location (JSON)
- area_hectares (DECIMAL)
- area_acres (DECIMAL)
- soil_type (VARCHAR)
- irrigation_type (ENUM)
- farm_type (ENUM)
- description (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

### Crops Table
```sql
- id (UUID, Primary Key)
- farm_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- crop_type (VARCHAR)
- variety (VARCHAR)
- planting_date (DATE)
- expected_harvest_date (DATE)
- actual_harvest_date (DATE)
- area_hectares (DECIMAL)
- area_acres (DECIMAL)
- status (ENUM)
- growth_stage (VARCHAR)
- expected_yield (DECIMAL)
- actual_yield (DECIMAL)
- cost_per_hectare (DECIMAL)
- revenue_per_hectare (DECIMAL)
- notes (TEXT)
- weather_conditions (JSON)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

### Disease Detections Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- crop_id (UUID, Foreign Key)
- farm_id (UUID, Foreign Key)
- crop_type (VARCHAR)
- image_url (TEXT)
- image_public_id (VARCHAR)
- detected_disease (VARCHAR)
- confidence_score (DECIMAL)
- severity_level (ENUM)
- treatment_recommended (TEXT)
- pesticide_recommended (TEXT)
- prevention_tips (TEXT)
- treatment_applied (BOOLEAN)
- treatment_date (DATE)
- treatment_notes (TEXT)
- follow_up_required (BOOLEAN)
- follow_up_date (DATE)
- location (JSON)
- weather_conditions (JSON)
- is_verified (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL host | Yes |
| `DB_PORT` | MySQL port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT secret key | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No |
| `PORT` | Server port | No |
| `NODE_ENV` | Environment | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `WEATHER_API_KEY` | OpenWeather API key | No |
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
- **SQL Injection Prevention** - Sequelize ORM protection

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