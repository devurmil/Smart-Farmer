# 🚀 Render Deployment Guide for Smart Farmer Backend

## 📋 Prerequisites

Before deploying to Render, you need:
1. A Render account
2. A database (PostgreSQL recommended for Render)
3. Your Smart Farmer backend code

## 🗄️ Database Setup

### Option 1: Render PostgreSQL (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Choose a name (e.g., "smart-farmer-db")
4. Select your plan (Free tier available)
5. Choose a region close to your users
6. Click "Create Database"
7. **Save the connection details** - you'll need them for the next step

### Option 2: External Database
- **Supabase** (Free PostgreSQL)
- **PlanetScale** (Free MySQL)
- **Railway** (Free PostgreSQL)

## 🔧 Environment Variables Setup

### 1. Go to Your Backend Service
1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Choose the `backend` folder as the root directory
4. Set build command: `npm install`
5. Set start command: `npm start`

### 2. Set Environment Variables
In your Render service dashboard, go to **Environment** → **Environment Variables** and add:

#### Required Variables:
```bash
# Database Connection
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Security
JWT_SECRET=your_super_secure_random_secret_key_here

# Environment
NODE_ENV=production

# CORS (if needed)
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Optional Variables:
```bash
# Port (Render sets this automatically)
PORT=5000

# Logging
LOG_LEVEL=info

# File Upload (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Example DATABASE_URL Format
For Render PostgreSQL:
```
postgresql://username:password@host:port/database_name
```

Example:
```
postgresql://smartfarmer_user:password123@dpg-abc123-a.oregon-postgres.render.com/smartfarmer_db
```

## 🚀 Deployment Steps

### 1. Automatic Deployment
1. Connect your GitHub repository
2. Render will automatically detect changes
3. Every push to main branch triggers a new deployment

### 2. Manual Deployment
1. In your service dashboard, click "Manual Deploy"
2. Choose "Deploy latest commit"

## 🔍 Troubleshooting

### Common Issues:

#### 1. "Cannot read properties of null (reading 'replace')"
**Cause**: DATABASE_URL is not set
**Solution**: Set DATABASE_URL environment variable in Render

#### 2. "Database connection failed"
**Cause**: Database credentials or connection string incorrect
**Solution**: 
- Check DATABASE_URL format
- Verify database is running
- Check firewall/network access

#### 3. "JWT_SECRET not set"
**Cause**: Missing JWT_SECRET environment variable
**Solution**: Set a secure JWT_SECRET in Render

### Debug Steps:
1. Check Render service logs
2. Verify environment variables are set
3. Test database connection locally
4. Check database server status

## 📊 Monitoring

### 1. Logs
- View real-time logs in Render dashboard
- Set up log forwarding if needed

### 2. Health Checks
- Monitor service uptime
- Set up alerts for failures

### 3. Performance
- Monitor response times
- Check database query performance

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit secrets to Git
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use SSL connections
- Limit database access
- Regular backups

### 3. API Security
- Enable CORS properly
- Use HTTPS only
- Rate limiting (consider adding)

## 📝 Example .env.local (for reference only)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=your_super_secret_key_here

# Environment
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🎯 Quick Deployment Checklist

- [ ] Database created and running
- [ ] DATABASE_URL copied to Render
- [ ] JWT_SECRET set in Render
- [ ] NODE_ENV=production set
- [ ] Service deployed successfully
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Frontend can connect to backend

## 🆘 Need Help?

If you encounter issues:

1. **Check Render Logs**: Service dashboard → Logs
2. **Verify Environment Variables**: Service dashboard → Environment
3. **Test Database Connection**: Use database client to test connection
4. **Check Service Status**: Ensure service is running and healthy

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
- [Node.js Environment Variables](https://nodejs.org/docs/latest/api/process.html#processenv)

---

**Remember**: Never commit sensitive information like database passwords or JWT secrets to your Git repository!
