# 🚀 Supabase Transaction Pooler Setup Guide

## 📋 Overview

This guide helps you set up Supabase Transaction Pooler (Shared Pooler) for your Smart Farmer backend deployment on Render.

## 🔧 What is Transaction Pooler?

**Transaction Pooler** is Supabase's connection pooling solution that:
- ✅ **Manages database connections** efficiently
- ✅ **Reduces connection overhead** for your application
- ✅ **Improves performance** by reusing connections
- ✅ **Handles SSL connections** automatically
- ✅ **Works with Render** deployments

## 🗄️ Setup Steps

### Step 1: Enable Transaction Pooler in Supabase

1. **Go to Supabase Dashboard**
2. **Select your project**
3. **Project Settings** → **Database**
4. **Connection pooling** section
5. **Enable "Transaction Pooler"**
6. **Save changes**

### Step 2: Get Connection String

1. **In the same Database settings page**
2. **Look for "Connection string" section**
3. **Select "URI" format**
4. **Copy the connection string**

Your connection string should look like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Important**: Notice the port is **6543** (not 5432) and hostname contains **pooler.supabase.com**

### Step 3: Update Render Environment Variables

1. **Go to Render Dashboard**
2. **Your Service** → **Environment**
3. **Environment Variables**
4. **Update DATABASE_URL** with the pooler connection string

```bash
# ✅ Correct format for Transaction Pooler
DATABASE_URL=postgresql://postgres.abc123def456:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# ❌ Wrong format (direct connection)
DATABASE_URL=postgresql://postgres:password@db.abc123def456.supabase.co:5432/postgres
```

## 🔍 Connection String Breakdown

```
postgresql://postgres.abc123def456:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
│         │                    │        │                        │     │
│         │                    │        │                        │     └─ Database name
│         │                    │        │                        └─────── Port (6543 for pooler)
│         │                    │        └──────────────────────────────── Hostname (pooler)
│         │                    └───────────────────────────────────────── Password
│         └────────────────────────────────────────────────────────────── Username (with project ref)
└───────────────────────────────────────────────────────────────────────── Protocol
```

## ⚙️ Configuration Differences

### Direct Connection vs Transaction Pooler

| Feature | Direct Connection | Transaction Pooler |
|---------|------------------|-------------------|
| **Port** | 5432 | 6543 |
| **Hostname** | `db.xxx.supabase.co` | `aws-0-region.pooler.supabase.com` |
| **SSL** | Required | Required |
| **Connection Limit** | Higher | Lower (optimized) |
| **Performance** | Good | Better (connection reuse) |

## 🚀 Benefits of Transaction Pooler

### 1. **Better Performance**
- Connection reuse reduces overhead
- Faster query execution
- Lower latency

### 2. **Scalability**
- Handles more concurrent users
- Better connection management
- Reduced database load

### 3. **Reliability**
- Automatic connection health checks
- Better error handling
- Connection failover

## 🔧 Backend Configuration

The updated `database.js` automatically detects Transaction Pooler and applies:

### **Pooler-Specific Settings**
```javascript
// Connection pool optimized for pooler
pool: {
  max: 5,           // Lower max connections
  acquire: 15000,   // Faster acquisition
  idle: 5000,       // Shorter idle time
}

// SSL and timeout settings
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  statement_timeout: 30000,           // 30 second timeout
  idle_in_transaction_session_timeout: 30000, // Idle timeout
}
```

## 🧪 Testing Your Setup

### 1. **Test Connection String Format**
```bash
node test-database-url.js
```

Expected output:
```
✅ URL parsing successful!
   Protocol: postgresql:
   Host: aws-0-us-east-1.pooler.supabase.com
   Port: 6543
   Database: postgres
   Is Supabase Pooler: true
```

### 2. **Test Database Connection**
After deployment, check Render logs for:
```
🔌 Testing database connection...
✅ Database connection established successfully.
   Connection Type: Supabase Transaction Pooler
   Pool Settings: Optimized for connection pooling
```

## 🚨 Common Issues & Solutions

### Issue 1: "Connection refused on port 5432"
**Cause**: Using direct connection port instead of pooler port
**Solution**: Use port 6543 in your connection string

### Issue 2: "Host not found"
**Cause**: Wrong hostname format
**Solution**: Use `aws-0-region.pooler.supabase.com` format

### Issue 3: "SSL connection required"
**Cause**: Missing SSL configuration
**Solution**: The backend automatically handles this for pooler connections

### Issue 4: "Too many connections"
**Cause**: Connection pool not optimized
**Solution**: Backend automatically uses pooler-optimized settings

## 📊 Monitoring

### 1. **Supabase Dashboard**
- **Database** → **Connection pooling** → **Metrics**
- Monitor connection count
- Check pooler status

### 2. **Render Logs**
- Watch for connection success messages
- Monitor any connection errors
- Check pooler-specific logs

## 🎯 Deployment Checklist

- [ ] **Transaction Pooler enabled** in Supabase
- [ ] **Connection string copied** from Supabase dashboard
- [ ] **DATABASE_URL updated** in Render environment variables
- [ ] **Port 6543** used (not 5432)
- [ ] **Pooler hostname** format correct
- [ ] **Backend deployed** with updated configuration
- [ ] **Connection test successful** in Render logs

## 🔗 Useful Links

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

**Remember**: Transaction Pooler uses port **6543** and hostname format `aws-0-region.pooler.supabase.com`!
