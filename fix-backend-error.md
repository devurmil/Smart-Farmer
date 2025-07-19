# 🔧 Fix Backend Error - Module Not Found

## The Problem
You're getting a "MODULE_NOT_FOUND" error because the Node.js dependencies haven't been installed yet.

## ✅ Quick Fix (Step by Step)

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages like:
- express
- mysql2
- sequelize
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- multer
- cloudinary
- axios
- helmet
- joi
- morgan
- compression

### Step 3: Wait for Installation
The installation might take 1-2 minutes. You'll see something like:
```
npm WARN deprecated...
added 234 packages, and audited 235 packages in 45s
```

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
🚀 Smart Farm API Server is running!
📍 Port: 5000
🌍 Environment: development
📊 Database: Connected
🔗 Health Check: http://localhost:5000/health
📚 API Base URL: http://localhost:5000/api
```

## 🐛 If You Still Get Errors

### Error: "Cannot find module 'multer-storage-cloudinary'"
```bash
npm install multer-storage-cloudinary
```

### Error: "Cannot connect to database"
Make sure:
1. MySQL is running
2. Database `farmbuddy` exists
3. Your `.env` file has correct credentials

### Error: "Port 5000 already in use"
Change port in `.env` file:
```env
PORT=5001
```

## 📋 Complete Setup Checklist

- [ ] Navigate to backend folder: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Create database: `mysql -u root -p < ../setup-database.sql`
- [ ] Start server: `npm run dev`
- [ ] Test API: Open `http://localhost:5000/health`

## 🚀 Expected Result

After successful setup, you should see:
- Server running on port 5000
- Database connected
- All tables created automatically
- API endpoints ready to use

The error will be fixed once you run `npm install` in the backend folder!