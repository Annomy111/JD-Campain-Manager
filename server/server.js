const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const { seedEvents } = require('./data/demoEvents');
const { seedUsers } = require('./data/seedUsers');
const districtRoutes = require('./routes/districts');
const fileRoutes = require('./routes/files');
const eventRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');

const app = express();

// Enhanced error logging
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3005',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas connection
const MONGODB_URI = 'mongodb+srv://dietermeier82:7i4XxjLYal4P0Dxx@cluster0.3lg9t.mongodb.net/jdcampaignmanager?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
  
  // Seed data only if needed (first time setup)
  seedEvents()
    .then(() => console.log('Events seeded successfully'))
    .catch(err => console.error('Error seeding events:', err));
    
  seedUsers()
    .then(() => console.log('Users seeded successfully'))
    .catch(err => console.error('Error seeding users:', err));
})
.catch((err) => {
  console.error('MongoDB Atlas connection error:', err);
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/districts', districtRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all route für API 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  }
});
