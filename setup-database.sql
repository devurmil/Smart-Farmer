-- Smart Farm India Database Setup Script
-- Run this script to create the farmbuddy database and initial setup

-- Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS farmbuddy 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE farmbuddy;

-- The tables will be created automatically by Sequelize when the server starts
-- This script just ensures the database exists

-- Show database info
SELECT 'Database farmbuddy is ready!' as message;
SHOW DATABASES LIKE 'farmbuddy';

-- Optional: Show current database
SELECT DATABASE() as current_database;