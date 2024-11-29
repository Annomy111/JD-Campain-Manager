const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET all events
router.get('/', async (req, res) => {
  try {
    console.log('Getting all events');
    const events = await Event.find().sort({ startDate: 1 });
    console.log(`Found ${events.length} events:`, events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Events' });
  }
});

// GET events for a specific month
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    console.log(`Fetching events for ${year}-${month}`);
    
    // Create date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    
    console.log('Date range:', { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    // Debug: Zeige alle Events in der Datenbank
    const allEvents = await Event.find();
    console.log('All events in database:', allEvents);
    
    const events = await Event.find({
      startDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ startDate: 1 });
    
    console.log(`Found ${events.length} events for ${year}-${month}:`, events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Events' });
  }
});

// POST new event
router.post('/', async (req, res) => {
  try {
    console.log('Creating new event:', req.body);
    const event = new Event(req.body);
    await event.save();
    console.log('Event created:', event);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: 'Fehler beim Erstellen des Events' });
  }
});

// Make sure to export the router!
module.exports = router;
