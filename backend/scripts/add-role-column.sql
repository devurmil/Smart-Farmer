-- Add role column to users table
USE farmbuddy;

-- Add the role column to the existing users table
ALTER TABLE users 
ADD COLUMN role ENUM('farmer', 'owner') NOT NULL DEFAULT 'farmer';

-- Show the updated table structure
DESCRIBE users;

SELECT 'Role column added successfully!' as message;