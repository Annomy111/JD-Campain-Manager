const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = { seedUsers };
