require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spd-campaign', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Delete existing users
    await User.deleteMany({});
    console.log('Deleted existing users');

    // Create admin user
    const adminUser = new User({
      email: 'admin@spd-campaign.de',
      password: 'Admin2024!',
      name: 'Administrator',
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // Create manager user
    const managerUser = new User({
      email: 'manager@spd-campaign.de',
      password: 'Manager2024!',
      name: 'Manager',
      role: 'manager',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    await managerUser.save();
    console.log('Manager user created successfully');

    // Create volunteer user
    const volunteerUser = new User({
      email: 'helfer@spd-campaign.de',
      password: 'Helfer2024!',
      name: 'Helfer',
      role: 'volunteer',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    await volunteerUser.save();
    console.log('Volunteer user created successfully');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
