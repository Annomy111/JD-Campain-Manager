const express = require('express');
const router = express.Router();
const District = require('../models/District');

// Get all districts
router.get('/', async (req, res) => {
  try {
    const districts = await District.find();
    res.json(districts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one district
router.get('/:id', async (req, res) => {
  try {
    const district = await District.findOne({ districtId: req.params.id });
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.json(district);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update district progress
router.patch('/:id', async (req, res) => {
  try {
    const district = await District.findOne({ districtId: req.params.id });
    if (!district) {
      // If district doesn't exist, create it
      const newDistrict = new District({
        districtId: req.params.id,
        name: req.body.name || 'Unbekannter Bezirk',
        visitedHouses: req.body.visitedHouses || 0,
        totalHouses: req.body.totalHouses || 0
      });
      const savedDistrict = await newDistrict.save();
      return res.json(savedDistrict);
    }

    // Update existing district
    district.visitedHouses = req.body.visitedHouses;
    district.totalHouses = req.body.totalHouses;
    district.lastUpdated = Date.now();

    const updatedDistrict = await district.save();
    res.json(updatedDistrict);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a district
router.delete('/:id', async (req, res) => {
  try {
    const district = await District.findOneAndDelete({ districtId: req.params.id });
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.json({ message: 'District deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
