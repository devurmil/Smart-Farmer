require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { User } = require('../models');

async function setAdminRole(email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log('Role updated to admin for:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error updating role:', err);
    process.exit(1);
  }
}

// Usage: node backend/scripts/setAdminRole.js your-admin-email@example.com
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email as an argument.');
  process.exit(1);
}
setAdminRole(email); 