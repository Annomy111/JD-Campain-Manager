const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // For Replit, use the REPLIT_DB_URL environment variable
    const mongoURI = process.env.REPLIT_DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/jdcampaignmanager';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit the process, just log the error
    console.error('Please make sure MongoDB is running and the connection URL is correct');
  }
};

module.exports = connectDB;
