-- Smart Farm India Database Setup Script
-- Run this script to create the database and initial setup

-- Create database
CREATE DATABASE IF NOT EXISTS smart_farm_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE smart_farm_db;

-- Create a dedicated user for the application (optional but recommended)
-- Replace 'your_password' with a strong password
CREATE USER IF NOT EXISTS 'smart_farm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smart_farm_db.* TO 'smart_farm_user'@'localhost';
FLUSH PRIVILEGES;

-- The tables will be created automatically by Sequelize when the server starts
-- This script just ensures the database exists and user has proper permissions

-- Optional: Create some indexes for better performance (these will be created by Sequelize too)
-- But you can run these manually if needed:

/*
-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_login_method ON users(login_method);
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_farms_is_active ON farms(is_active);
CREATE INDEX idx_crops_user_id ON crops(user_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_crops_crop_type ON crops(crop_type);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_disease_detections_user_id ON disease_detections(user_id);
CREATE INDEX idx_disease_detections_crop_id ON disease_detections(crop_id);
CREATE INDEX idx_disease_detections_farm_id ON disease_detections(farm_id);
CREATE INDEX idx_disease_detections_created_at ON disease_detections(created_at);
CREATE INDEX idx_weather_data_farm_id ON weather_data(farm_id);
CREATE INDEX idx_weather_data_date ON weather_data(date);
CREATE INDEX idx_cost_plans_user_id ON cost_plans(user_id);
CREATE INDEX idx_cost_plans_crop_type ON cost_plans(crop_type);
CREATE INDEX idx_cost_plans_year ON cost_plans(year);
*/

-- Show database info
SELECT 'Database created successfully!' as message;
SHOW DATABASES LIKE 'smart_farm_db';