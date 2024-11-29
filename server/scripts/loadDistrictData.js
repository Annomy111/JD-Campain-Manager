require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const District = require('../models/District');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spd-campaign', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function loadDistrictData() {
  try {
    // Read the district data
    const dataPath = path.join(__dirname, '../data/district113.json');
    const districtData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Check if district already exists
    let district = await District.findOne({ districtId: districtData.districtId });

    if (district) {
      console.log('Updating existing district...');
      district = await District.findOneAndUpdate(
        { districtId: districtData.districtId },
        districtData,
        { new: true }
      );
    } else {
      console.log('Creating new district...');
      district = new District(districtData);
      await district.save();
    }

    console.log('District data loaded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error loading district data:', err);
    process.exit(1);
  }
}

loadDistrictData();
