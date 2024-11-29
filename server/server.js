const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const { seedEvents } = require('./data/demoEvents');
const { seedUsers } = require('./data/seedUsers');
const districtRoutes = require('./routes/districts');
const fileRoutes = require('./routes/files');
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// Enhanced error logging
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// MongoDB connection with debug logging
mongoose.set('debug', true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spd-campaign', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully');
    
    // Seed initial data
    await seedUsers();
    console.log('Users seeded successfully');
    
    // Überprüfe vorhandene Events
    const Event = require('./models/Event');
    const existingEvents = await Event.find();
    
    if (existingEvents.length === 0) {
      // Seed Events nach erfolgreicher Datenbankverbindung
      await seedEvents();
    }
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all route für API 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  }
});
