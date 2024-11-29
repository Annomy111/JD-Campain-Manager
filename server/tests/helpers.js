const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let mongoServer;

const testHelpers = {
  setupTestDB: async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  },

  teardownTestDB: async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  },

  clearDatabase: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  },

  generateTestToken: (userId) => {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  createTestUser: async (userData = {}) => {
    const defaultUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };

    const user = new User({
      ...defaultUser,
      ...userData
    });

    await user.save();
    return user;
  }
};

module.exports = testHelpers;