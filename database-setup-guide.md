# 🗄️ Database Setup Guide - Step by Step

## Method 1: Using MySQL Command Line (Recommended)

### Step 1: Open Command Prompt/Terminal
- Press `Windows + R`, type `cmd`, press Enter
- Or search "Command Prompt" in Start menu

### Step 2: Connect to MySQL
```bash
mysql -u root -p
```
- Enter your password: `Urmil@123`

### Step 3: Create the Database
```sql
CREATE DATABASE farmbuddy;
```

### Step 4: Verify Database Creation
```sql
SHOW DATABASES;
```
You should see `farmbuddy` in the list.

### Step 5: Exit MySQL
```sql
EXIT;
```

---

## Method 2: Using the Setup Script (Easier)

### Step 1: Open Command Prompt in Project Folder
- Navigate to your Smart Farmer project folder
- Hold `Shift` + Right-click in the folder
- Select "Open PowerShell window here" or "Open command window here"

### Step 2: Run the Setup Script
```bash
mysql -u root -p < setup-database.sql
```
- Enter your password: `Urmil@123`

This will automatically create the `farmbuddy` database.

---

## Method 3: Using MySQL Workbench (GUI)

### Step 1: Open MySQL Workbench
- Launch MySQL Workbench application

### Step 2: Connect to Local Server
- Click on "Local instance MySQL80" (or similar)
- Enter password: `Urmil@123`

### Step 3: Create Database
- Click on "Create a new schema" button (database icon)
- Name: `farmbuddy`
- Click "Apply"

---

## Method 4: Using phpMyAdmin (If Installed)

### Step 1: Open phpMyAdmin
- Go to `http://localhost/phpmyadmin` in browser

### Step 2: Login
- Username: `root`
- Password: `Urmil@123`

### Step 3: Create Database
- Click "Databases" tab
- Enter database name: `farmbuddy`
- Click "Create"

---

## ✅ Verify Database is Created

After creating the database, verify it exists:

### Using Command Line:
```bash
mysql -u root -p
SHOW DATABASES;
```

### Using MySQL Workbench:
- Refresh the schemas panel
- You should see `farmbuddy` listed

---

## 🚀 Next Steps

After creating the database:

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the Backend Server:**
   ```bash
   npm run dev
   ```

3. **The server will automatically:**
   - Connect to your `farmbuddy` database
   - Create all necessary tables
   - Start listening on `http://localhost:5000`

4. **Test the Connection:**
   - Open browser: `http://localhost:5000/health`
   - You should see: "Smart Farm API is running"

---

## 🐛 Troubleshooting

### Error: "Access denied for user 'root'"
- Make sure MySQL service is running
- Check your password is correct: `Urmil@123`

### Error: "mysql command not found"
- Add MySQL to your system PATH
- Or use full path: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

### Error: "Database already exists"
- That's fine! The database is already created
- You can proceed to start the backend server

### Can't connect to MySQL server
- Make sure MySQL service is running
- Check Windows Services for "MySQL80" service
- Start it if it's stopped

---

## 📝 Summary

The easiest method is **Method 2** using the setup script:

```bash
# In your Smart Farmer project folder
mysql -u root -p < setup-database.sql
```

Then start the backend:
```bash
cd backend
npm install
npm run dev
```

Your database will be ready and the backend will create all tables automatically!