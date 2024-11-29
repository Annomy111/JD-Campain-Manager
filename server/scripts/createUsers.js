const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const users = [
  {
    email: 'admin@spd-campaign.de',
    password: 'Admin2024!',
    name: 'Administrator',
    role: 'admin',
    division: 'Leitung'
  },
  {
    email: 'manager@spd-campaign.de',
    password: 'Manager2024!',
    name: 'Manager',
    role: 'manager',
    division: 'Koordination'
  },
  {
    email: 'helfer@spd-campaign.de',
    password: 'Helfer2024!',
    name: 'Test Helfer',
    role: 'volunteer',
    division: 'Wahlkampf'
  }
];

async function createUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campaign-manager');
    console.log('Connected to MongoDB');

    // Create users
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword,
          lastLogin: new Date()
        });
        
        await user.save();
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`User ${userData.email} already exists`);
      }
    }

    console.log('\nTest users created successfully!');
    console.log('\nLogin credentials:');
    console.log('-------------------');
    users.forEach(user => {
      console.log(`\nRole: ${user.role}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createUsers();
