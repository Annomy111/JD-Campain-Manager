const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Infostand', 'Hausbesuch', 'Veranstaltung', 'Sitzung', 'Schulung']
  },
  participants: [{
    type: String
  }]
}, {
  timestamps: true
});

// Virtuelle Eigenschaft für Monat und Jahr
eventSchema.virtual('monthYear').get(function() {
  return `${this.startDate.getFullYear()}-${this.startDate.getMonth() + 1}`;
});

// Stelle sicher, dass virtuelle Eigenschaften bei der Konvertierung zu JSON eingeschlossen werden
eventSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
