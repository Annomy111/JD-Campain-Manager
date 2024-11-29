const mongoose = require('mongoose');

const DistrictSchema = new mongoose.Schema({
  districtId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  visitedHouses: {
    type: Number,
    default: 0
  },
  totalHouses: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('District', DistrictSchema);
