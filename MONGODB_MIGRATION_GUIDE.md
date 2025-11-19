# MongoDB Migration Guide

## ✅ Completed

1. ✅ Updated `package.json` - Added mongoose, removed sequelize dependencies
2. ✅ Updated `backend/config/database.js` - Now uses Mongoose connection
3. ✅ Converted all models to Mongoose schemas:
   - User.js
   - Farm.js
   - Crop.js
   - Equipment.js
   - Booking.js
   - Maintenance.js
   - Supply.js
   - SupplyOrder.js
   - DiseaseDetection.js
   - WeatherData.js
   - CostPlan.js
4. ✅ Updated `backend/models/index.js` - Exports Mongoose models
5. ✅ Updated `backend/server.js` - Uses Mongoose connection
6. ✅ Updated controllers:
   - equipmentController.js
   - bookingController.js
   - supplyController.js
   - maintenanceController.js
7. ✅ Updated services:
   - inventoryService.js

## ⚠️ Still Needs Migration

### Routes (Need Sequelize → Mongoose conversion)

The following route files still use Sequelize syntax and need to be updated:

1. **backend/routes/auth.js** - Authentication routes
   - Replace `User.findByPk()` → `User.findById()`
   - Replace `User.create()` → `User.create()` (same, but check syntax)
   - Replace `user.update()` → `User.findByIdAndUpdate()`
   - Replace `user.destroy()` → `User.findByIdAndDelete()`
   - Replace `Op.or` → `$or`
   - Replace `Op.in` → `$in`

2. **backend/routes/users.js** - User management routes
   - Replace `User.findAll()` → `User.find()`
   - Replace `User.findByPk()` → `User.findById()`
   - Replace `user.destroy()` → `User.findByIdAndDelete()`
   - Replace `Equipment.findAll()` → `Equipment.find()`
   - Replace `Supply.findAll()` → `Supply.find()`

3. **backend/routes/supplies.js** - Supply routes
   - Replace `Supply.findAll()` → `Supply.find()`
   - Replace `Supply.findByPk()` → `Supply.findById()`
   - Replace `supply.destroy()` → `Supply.findByIdAndDelete()`
   - Replace `SupplyOrder.create()` → `SupplyOrder.create()`
   - Replace `SupplyOrder.findAll()` → `SupplyOrder.find()`
   - Replace `SupplyOrder.findByPk()` → `SupplyOrder.findById()`
   - Replace `order.update()` → `SupplyOrder.findByIdAndUpdate()`
   - Replace `User.findAll()` → `User.find()`

4. **backend/routes/farms.js** - Farm routes
   - Replace `Farm.create()` → `Farm.create()`
   - Replace `farm.update()` → `Farm.findByIdAndUpdate()`
   - Replace `Op.gte` → `$gte`
   - Update populate syntax for crops

5. **backend/routes/disease.js** - Disease detection routes
   - Replace `DiseaseDetection.create()` → `DiseaseDetection.create()`
   - Replace `detection.update()` → `DiseaseDetection.findByIdAndUpdate()`

6. **backend/routes/crops.js** - Crop routes
   - Replace `Crop.findAndCountAll()` → Use `Crop.find()` + `Crop.countDocuments()`
   - Replace `Crop.findOne()` → `Crop.findOne()`
   - Replace `Crop.findByPk()` → `Crop.findById()`
   - Replace `crop.update()` → `Crop.findByIdAndUpdate()`
   - Replace `DiseaseDetection.findAll()` → `DiseaseDetection.find()`

7. **backend/routes/cost-planning.js** - Cost planning routes
   - Replace `CostPlan.create()` → `CostPlan.create()`
   - Replace `costPlan.destroy()` → `CostPlan.findByIdAndDelete()`

8. **backend/routes/equipment.js** - Equipment routes (partial)
   - Some routes may already be updated via controller

### Middleware

1. **backend/middleware/auth.js** - Authentication middleware
   - Replace `User.findByPk()` → `User.findById()`

### Scripts (Optional - Can be removed or updated)

These scripts were for Sequelize database setup and may not be needed with MongoDB:
- `backend/scripts/fix-database.js`
- `backend/scripts/add-social-login-columns.js`
- `backend/scripts/add-role-selection-column.js`

## Key Conversion Patterns

### Query Methods

| Sequelize | Mongoose |
|-----------|----------|
| `Model.findByPk(id)` | `Model.findById(id)` |
| `Model.findAll({ where: {...} })` | `Model.find({...})` |
| `Model.findOne({ where: {...} })` | `Model.findOne({...})` |
| `Model.findAndCountAll({ where: {...} })` | `Model.find({...})` + `Model.countDocuments({...})` |
| `Model.create(data)` | `Model.create(data)` (same) |
| `instance.update(data)` | `Model.findByIdAndUpdate(id, data, { new: true })` |
| `instance.destroy()` | `Model.findByIdAndDelete(id)` |
| `Model.count({ where: {...} })` | `Model.countDocuments({...})` |

### Operators

| Sequelize | Mongoose |
|-----------|----------|
| `Op.in` | `$in` |
| `Op.or` | `$or` |
| `Op.and` | `$and` |
| `Op.gte` | `$gte` |
| `Op.lte` | `$lte` |
| `Op.gt` | `$gt` |
| `Op.lt` | `$lt` |
| `Op.between` | `$gte` + `$lte` |
| `Op.like` | `$regex` |

### Includes/Populate

| Sequelize | Mongoose |
|-----------|----------|
| `include: [{ model: User, as: 'owner' }]` | `.populate('ownerId', 'name email')` |

### ObjectId Conversion

When working with IDs, convert strings to ObjectId:
```javascript
const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId.isValid(id) 
  ? new mongoose.Types.ObjectId(id) 
  : id;
```

### ID Comparisons

In Mongoose, IDs are ObjectIds. Compare as strings:
```javascript
// Sequelize
if (item.userId === req.user.id) { ... }

// Mongoose
if (item.userId.toString() === req.user.id.toString()) { ... }
```

## Environment Variables

Update your `.env` file or Render environment variables:

```env
# Remove these (if using MySQL/PostgreSQL):
# DB_HOST=...
# DB_NAME=...
# DB_USER=...
# DB_PASSWORD=...

# Add this:
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/SmartFarmer

# Or use DATABASE_URL (will be detected automatically):
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/SmartFarmer
```

## Testing

After migration:
1. Test all API endpoints
2. Verify authentication works
3. Check that all CRUD operations work
4. Verify relationships (populate) work correctly
5. Test date range queries
6. Test filtering and sorting

## Notes

- MongoDB uses `_id` instead of `id` by default, but Mongoose can handle both
- UUIDs in Sequelize become ObjectIds in MongoDB
- JSON fields in Sequelize become Mixed types in Mongoose
- Timestamps are automatically handled by Mongoose
- Indexes are defined in schema, not separate migration files

