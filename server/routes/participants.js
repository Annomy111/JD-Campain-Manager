const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const handleError = require('../utils/errorHandler');

// GET /api/participants
// Alle Teilnehmer abrufen mit optionaler Filterung
router.get('/', async (req, res) => {
  try {
    const { search, role, active } = req.query;
    const query = {};

    // Suchfilter
    if (search) {
      query.$text = { $search: search };
    }

    // Rollenfilter
    if (role) {
      query.role = role;
    }

    // Aktivitätsfilter
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const participants = await Participant
      .find(query)
      .populate('events', 'title startDate')
      .sort({ name: 1 });

    res.json(participants);
  } catch (error) {
    handleError(res, error, 'Abrufen der Teilnehmer');
  }
});

// GET /api/participants/:id
// Einzelnen Teilnehmer abrufen
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant
      .findById(req.params.id)
      .populate('events', 'title startDate location');

    if (!participant) {
      return res.status(404).json({ message: 'Teilnehmer nicht gefunden' });
    }

    res.json(participant);
  } catch (error) {
    handleError(res, error, 'Abrufen des Teilnehmers');
  }
});

// POST /api/participants
// Neuen Teilnehmer erstellen
router.post('/', async (req, res) => {
  try {
    const participant = new Participant(req.body);
    await participant.save();
    res.status(201).json(participant);
  } catch (error) {
    handleError(res, error, 'Erstellen des Teilnehmers');
  }
});

// PUT /api/participants/:id
// Teilnehmer aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Teilnehmer nicht gefunden' });
    }

    res.json(participant);
  } catch (error) {
    handleError(res, error, 'Aktualisieren des Teilnehmers');
  }
});

// DELETE /api/participants/:id
// Teilnehmer löschen (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Teilnehmer nicht gefunden' });
    }

    res.json({ message: 'Teilnehmer erfolgreich deaktiviert' });
  } catch (error) {
    handleError(res, error, 'Deaktivieren des Teilnehmers');
  }
});

// POST /api/participants/:id/events/:eventId
// Teilnehmer zu Event hinzufügen
router.post('/:id/events/:eventId', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Teilnehmer nicht gefunden' });
    }

    if (!participant.events.includes(req.params.eventId)) {
      participant.events.push(req.params.eventId);
      await participant.save();
    }

    res.json(participant);
  } catch (error) {
    handleError(res, error, 'Hinzufügen des Events');
  }
});

// DELETE /api/participants/:id/events/:eventId
// Teilnehmer von Event entfernen
router.delete('/:id/events/:eventId', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Teilnehmer nicht gefunden' });
    }

    participant.events = participant.events.filter(
      eventId => eventId.toString() !== req.params.eventId
    );
    await participant.save();

    res.json(participant);
  } catch (error) {
    handleError(res, error, 'Entfernen des Events');
  }
});

module.exports = router;
