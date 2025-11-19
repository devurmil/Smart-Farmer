# 🚀 Render Deployment Guide for Smart Farmer Backend

## 📋 Prerequisites

Before deploying to Render, you need:
1. A Render account
2. A MongoDB database (Atlas cluster recommended)
3. Smart Farmer backend code in GitHub/GitLab

## 🗄️ Database Setup (MongoDB Atlas)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a free cluster (Shared tier is enough for testing).
3. Create a database user with **Read/Write** access.
4. In **Network Access**, allow:
   - Your local IP (for testing), and
   - `0.0.0.0/0` or Render IP ranges (for production).
5. Copy the **connection string** (SRV format).
6. Replace `<username>`, `<password>`, and `<dbname>` accordingly.

Example:
```
mongodb+srv://smartfarmer_admin:superSecret@cluster0.abcde.mongodb.net/smart_farmer
```

## 🔧 Environment Variables Setup

### Create / configure the Render service
1. In Render Dashboard, click **New + → Web Service**.
2. Connect your repository.
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`

### Required environment variables
Set these under **Environment → Environment Variables**:

```bash
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smart_farmer

# Authentication
JWT_SECRET=your_super_secure_random_secret_key_here
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Gmail API (OTP emails via HTTPS)
GOOGLE_EMAIL=your_gmail_address@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
USE_GMAIL_API=true
```

Optional:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
WEATHER_API_KEY=your_openweather_api_key
```

## 🚀 Deployment Steps

1. Push your latest code to the default branch.
2. Render builds automatically; watch the deploy logs.
3. Once live, hit `https://your-service.onrender.com/api/health/db` to verify Mongo connectivity.

## 🔍 Troubleshooting

### 1. “MONGO_URL is not set”
- Render couldn’t find the env var.
- Set `MONGO_URL` exactly (case-sensitive) and redeploy.

### 2. “Unable to connect to MongoDB”
- Check that the connection string is correct (username/password/db name).
- Ensure Atlas allows connections from Render (0.0.0.0/0 during testing).
- If you rotated credentials, update Render env vars.

### 3. OTP emails failing
- Gmail API vars missing or refresh token invalid.
- Re-run the OAuth flow via Google Playground and update env vars.

### Validate locally before deploying
```bash
# Verify connection string format
node test-database-url.js

# Attempt a real connection using mongoose
node test-database-connection.cjs
```

## 📊 Monitoring

- **Logs**: Render dashboard → Logs
- **DB Health**: `GET /api/health/db`
- **SSE/Realtime**: Ensure cookies are sent (use `withCredentials` on the frontend)

## 🔒 Security Best Practices

- Never commit `.env` files.
- Rotate `JWT_SECRET` and database passwords periodically.
- Limit MongoDB user permissions to only the target database.
- Keep CORS `FRONTEND_URL` restricted to trusted origins.

## 📝 Example `.env` for production

```bash
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/smart_farmer
JWT_SECRET=<generated_random_secret>
NODE_ENV=production
FRONTEND_URL=https://smart-farmer-three.vercel.app
GOOGLE_EMAIL=smartfarmer117@gmail.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
USE_GMAIL_API=true
```

## 🎯 Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] `MONGO_URL` + Gmail credentials set in Render
- [ ] Backend deployed without errors
- [ ] `/api/health/db` returns `success: true`
- [ ] OTP emails reach inbox (or Gmail API logs success)
- [ ] Frontend fetches include `credentials: 'include'`

## 🆘 Need Help?

1. Check Render logs for stack traces.
2. Re-run `node test-database-connection.cjs` locally.
3. Verify Atlas network rules and database users.
4. Confirm env vars (Render Dashboard → Environment) match expectations.

## 🔗 Useful Links

- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Quickstart](https://www.mongodb.com/docs/atlas/getting-started/)
- [Google OAuth Playground](https://developers.google.com/oauthplayground)

---

**Remember**: never store secrets in Git. Use Render’s environment variable manager for production credentials.
