# 🗄️ MySQL Database Tables - Smart Farm Data Storage

## Database Location
Your data is saved in the **`farmbuddy`** database on your local MySQL server at `localhost:3306`.

## 📊 Database Tables Created

When you start the backend server, Sequelize will automatically create these tables in your `farmbuddy` database:

### 1. **`users`** Table
**Stores user account information**
```sql
- id (UUID) - Primary Key
- name (VARCHAR) - User's full name
- email (VARCHAR) - Email address (unique)
- password (VARCHAR) - Hashed password
- profile_picture (TEXT) - Profile image URL
- login_method (ENUM) - 'email', 'facebook', 'google'
- is_verified (BOOLEAN) - Email verification status
- phone (VARCHAR) - Phone number
- location (JSON) - User's location data
- last_login (DATETIME) - Last login timestamp
- created_at (DATETIME) - Account creation date
- updated_at (DATETIME) - Last update date
```

### 2. **`farms`** Table
**Stores farm information**
```sql
- id (UUID) - Primary Key
- user_id (UUID) - Foreign Key to users table
- name (VARCHAR) - Farm name
- location (JSON) - Farm coordinates and address
- area_hectares (DECIMAL) - Farm area in hectares
- area_acres (DECIMAL) - Farm area in acres
- soil_type (VARCHAR) - Type of soil
- irrigation_type (ENUM) - 'drip', 'sprinkler', 'flood', 'rain_fed', 'mixed'
- farm_type (ENUM) - 'organic', 'conventional', 'mixed'
- description (TEXT) - Farm description
- is_active (BOOLEAN) - Active status
- created_at (DATETIME) - Creation date
- updated_at (DATETIME) - Last update date
```

### 3. **`crops`** Table
**Stores crop information and lifecycle data**
```sql
- id (UUID) - Primary Key
- farm_id (UUID) - Foreign Key to farms table
- user_id (UUID) - Foreign Key to users table
- crop_type (VARCHAR) - Type of crop (Wheat, Cotton, etc.)
- variety (VARCHAR) - Crop variety
- planting_date (DATE) - When crop was planted
- expected_harvest_date (DATE) - Expected harvest date
- actual_harvest_date (DATE) - Actual harvest date
- area_hectares (DECIMAL) - Area in hectares
- area_acres (DECIMAL) - Area in acres
- status (ENUM) - 'planned', 'planted', 'growing', 'flowering', 'harvested', 'failed'
- growth_stage (VARCHAR) - Current growth stage
- expected_yield (DECIMAL) - Expected yield in kg/hectare
- actual_yield (DECIMAL) - Actual yield in kg/hectare
- cost_per_hectare (DECIMAL) - Cost per hectare
- revenue_per_hectare (DECIMAL) - Revenue per hectare
- notes (TEXT) - Additional notes
- weather_conditions (JSON) - Weather data
- is_active (BOOLEAN) - Active status
- created_at (DATETIME) - Creation date
- updated_at (DATETIME) - Last update date
```

### 4. **`disease_detections`** Table
**Stores AI disease detection results**
```sql
- id (UUID) - Primary Key
- user_id (UUID) - Foreign Key to users table
- crop_id (UUID) - Foreign Key to crops table
- farm_id (UUID) - Foreign Key to farms table
- crop_type (VARCHAR) - Type of crop analyzed
- image_url (TEXT) - URL of uploaded image
- image_public_id (VARCHAR) - Cloudinary image ID
- detected_disease (VARCHAR) - Disease detected by AI
- confidence_score (DECIMAL) - AI confidence percentage
- severity_level (ENUM) - 'None', 'Low', 'Moderate', 'High', 'Very High'
- treatment_recommended (TEXT) - Recommended treatment
- pesticide_recommended (TEXT) - Recommended pesticide
- prevention_tips (TEXT) - Prevention advice
- treatment_applied (BOOLEAN) - Whether treatment was applied
- treatment_date (DATE) - Date treatment was applied
- treatment_notes (TEXT) - Treatment notes
- follow_up_required (BOOLEAN) - Follow-up needed
- follow_up_date (DATE) - Follow-up date
- location (JSON) - GPS coordinates
- weather_conditions (JSON) - Weather at detection time
- is_verified (BOOLEAN) - Expert verification
- created_at (DATETIME) - Detection date
- updated_at (DATETIME) - Last update date
```

### 5. **`weather_data`** Table
**Stores weather information for farms**
```sql
- id (UUID) - Primary Key
- farm_id (UUID) - Foreign Key to farms table
- location (JSON) - Weather location coordinates
- date (DATE) - Weather date
- temperature_max (DECIMAL) - Maximum temperature (°C)
- temperature_min (DECIMAL) - Minimum temperature (°C)
- temperature_avg (DECIMAL) - Average temperature (°C)
- humidity (DECIMAL) - Humidity percentage
- rainfall (DECIMAL) - Rainfall in mm
- wind_speed (DECIMAL) - Wind speed in km/h
- wind_direction (VARCHAR) - Wind direction
- pressure (DECIMAL) - Atmospheric pressure
- uv_index (DECIMAL) - UV index
- visibility (DECIMAL) - Visibility in km
- weather_condition (VARCHAR) - Weather description
- weather_icon (VARCHAR) - Weather icon code
- sunrise (TIME) - Sunrise time
- sunset (TIME) - Sunset time
- data_source (VARCHAR) - Weather data source
- is_forecast (BOOLEAN) - Forecast vs historical data
- created_at (DATETIME) - Record creation date
- updated_at (DATETIME) - Last update date
```

### 6. **`cost_plans`** Table
**Stores cost planning and analysis data**
```sql
- id (UUID) - Primary Key
- user_id (UUID) - Foreign Key to users table
- farm_id (UUID) - Foreign Key to farms table
- crop_id (UUID) - Foreign Key to crops table
- crop_type (VARCHAR) - Type of crop
- area_unit (ENUM) - 'acre', 'hectare', 'sq_meter', 'bigha'
- area_value (DECIMAL) - Area value
- total_cost (DECIMAL) - Total calculated cost
- cost_breakdown (JSON) - Detailed cost breakdown
- season (VARCHAR) - Planting season
- year (INTEGER) - Year of planning
- planting_month (VARCHAR) - Planting month
- harvesting_month (VARCHAR) - Harvesting month
- expected_yield (DECIMAL) - Expected yield in kg
- expected_revenue (DECIMAL) - Expected revenue
- expected_profit (DECIMAL) - Expected profit
- market_price_per_kg (DECIMAL) - Market price per kg
- notes (TEXT) - Additional notes
- is_template (BOOLEAN) - Template for reuse
- is_active (BOOLEAN) - Active status
- created_at (DATETIME) - Creation date
- updated_at (DATETIME) - Last update date
```

## 🔍 How to View Your Data

### Using MySQL Command Line:
```sql
-- Connect to MySQL
mysql -u root -p

-- Use your database
USE farmbuddy;

-- Show all tables
SHOW TABLES;

-- View users data
SELECT * FROM users;

-- View farms data
SELECT * FROM farms;

-- View crops data
SELECT * FROM crops;

-- View disease detections
SELECT * FROM disease_detections;

-- View cost plans
SELECT * FROM cost_plans;
```

### Using MySQL Workbench or phpMyAdmin:
1. Connect to `localhost:3306`
2. Select `farmbuddy` database
3. Browse tables to see your data

## 📈 Data Flow Example

When you use the app:

1. **Register/Login** → Data saved in `users` table
2. **Create Farm** → Data saved in `farms` table
3. **Add Crop** → Data saved in `crops` table
4. **Detect Disease** → Image and results saved in `disease_detections` table
5. **Plan Costs** → Calculations saved in `cost_plans` table
6. **Weather Data** → Weather info saved in `weather_data` table

All data is automatically saved to your local MySQL `farmbuddy` database when you use the API endpoints!