const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Mitglied', 'Freiwilliger', 'Organisator', 'Unterstützer'],
    default: 'Unterstützer'
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
});

// Virtuelle Eigenschaft für die Anzahl der Events
participantSchema.virtual('eventCount').get(function() {
  return this.events.length;
});

// Index für effiziente Suche
participantSchema.index({ name: 'text', email: 'text', location: 'text' });

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
