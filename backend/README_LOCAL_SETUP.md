# 🚀 Running Backend Locally

This guide will help you run the Smart Farmer backend server on your local machine.

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ Node.js installed (v14 or higher)
- ✅ MongoDB connection string (already in your `.env`)
- ✅ `.env` file configured in the `backend` folder

---

## 🔧 Setup (One-Time)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify `.env` File
Make sure your `backend/.env` file has these **critical** variables:

```bash
NODE_ENV=development
PORT=5000
MONGO_URL=mongodb+srv://smartfarmer117:smart%40117@farmbuddy.twfxdrl.mongodb.net/
JWT_SECRET=smart_farm_super_secret_jwt_key_2024_urmil_farmbuddy
FRONTEND_URL=http://localhost:5173
```

**Important:** `NODE_ENV=development` is crucial for local development!

---

## ▶️ Running the Backend

### Option 1: Standard Start (Recommended)
```bash
cd backend
npm start
```

**What this does:**
- Starts the server on `http://localhost:5000`
- Connects to MongoDB
- Enables development mode features:
  - ✅ Non-secure cookies (works on `localhost`)
  - ✅ Email OTPs logged to console
  - ✅ Detailed error messages

### Option 2: Development Mode with Auto-Restart
If you want the server to automatically restart when you make code changes:

```bash
cd backend
npm run dev
```

**Note:** This requires `nodemon` to be installed. If not installed:
```bash
npm install --save-dev nodemon
```

Then add this to `backend/package.json` scripts:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## ✅ Verify It's Working

### 1. Check Terminal Output
You should see:
```
🔧 Database Configuration:
   NODE_ENV: development
   MONGO_URL: Set
✅ MongoDB connected successfully.
🚀 Server is running on port 5000
```

### 2. Test the API
Open your browser or use `curl`:
```bash
curl http://localhost:5000/api/health
```

Or visit: `http://localhost:5000/api/health`

---

## 🛑 Stopping the Backend

### If Running in Terminal:
Press `Ctrl + C`

### If Running in Background:
```bash
# Find the process
lsof -i :5000

# Kill it
kill -9 <PID>
```

Or use:
```bash
fuser -k 5000/tcp
```

---

## 🔍 Troubleshooting

### Problem: Port 5000 Already in Use
**Solution:**
```bash
# Kill existing process on port 5000
fuser -k 5000/tcp

# Then start again
npm start
```

### Problem: MongoDB Connection Failed
**Solution:**
- Check your internet connection
- Verify `MONGO_URL` in `.env` is correct
- Make sure your IP is whitelisted in MongoDB Atlas

### Problem: "Cannot find module"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: OTP Email Not Sending
**This is expected in development!** 
- Check your terminal output
- The OTP will be logged to the console like this:
```
=================================================
📧 DEVELOPMENT MODE - EMAIL MOCK
To: user@example.com
Subject: Your Smart Farmer OTP
Content: Your OTP for Smart Farmer is: 123456
=================================================
```

---

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── equipment.js      # Equipment routes
│   ├── maintenance.js    # Maintenance routes
│   └── ...
├── controllers/           # Business logic
├── models/               # MongoDB models
├── services/             # External services (email, etc.)
├── config/               # Configuration files
├── .env                  # Environment variables (DO NOT COMMIT!)
└── package.json          # Dependencies
```

---

## 🌐 Running Frontend + Backend Together

### Terminal 1 (Backend):
```bash
cd backend
npm start
```

### Terminal 2 (Frontend):
```bash
cd ..  # Go back to root
npm run dev
```

**Access the app:**
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`

**How they connect:**
- Vite proxy forwards `/api` requests to `http://localhost:5000`
- No CORS issues because of the proxy!

---

## 🔐 Environment Variables Reference

| Variable | Local Value | Production Value |
|----------|-------------|------------------|
| `NODE_ENV` | `development` | `production` |
| `PORT` | `5000` | `5000` |
| `FRONTEND_URL` | `http://localhost:5173` | `https://smart-farmer-three.vercel.app` |
| `MONGO_URL` | Your MongoDB connection | Same |
| `JWT_SECRET` | Your secret | Same |

---

## 🎯 Quick Reference Commands

```bash
# Start backend
cd backend && npm start

# Stop backend (if running in terminal)
Ctrl + C

# Kill backend process
fuser -k 5000/tcp

# View logs (if running in background)
# Check the terminal where you started it

# Restart backend
fuser -k 5000/tcp && npm start
```

---

## 📝 Notes

1. **Always run backend from the `backend` directory**, not the root!
2. **Keep `NODE_ENV=development`** in your local `.env`
3. **Never commit `.env` files** - they're in `.gitignore`
4. **OTPs are logged to console** in development mode
5. **Cookies work on `localhost`** because `secure: false` in development

---

## 🆘 Need Help?

If you encounter issues:
1. Check the terminal output for error messages
2. Verify your `.env` file has all required variables
3. Make sure MongoDB is accessible
4. Ensure port 5000 is not blocked by firewall
5. Try restarting both frontend and backend

---

**Happy Coding! 🚀**
