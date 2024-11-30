const Event = require('../models/Event');
const mongoose = require('mongoose');

const demoEvents = [
  {
    title: "Wahlkampfauftakt",
    description: "Großer Wahlkampfauftakt mit allen Unterstützern und Freiwilligen. Vorstellung der Kampagnenstrategie 'Der Winter wird rot'.",
    location: "SPD-Parteizentrale Moers",
    startDate: new Date('2024-12-01T18:00:00'),
    endDate: new Date('2024-12-01T21:00:00'),
    type: "Veranstaltung",
    participants: ["Jan Dieren", "Team Moers", "Team Neukirchen"]
  },
  {
    title: "Infostand Neumarkt",
    description: "Infostand mit Glühwein und Informationsmaterial zur Kampagne",
    location: "Neumarkt Moers",
    startDate: new Date('2024-12-04T10:00:00'),
    endDate: new Date('2024-12-04T16:00:00'),
    type: "Infostand",
    participants: ["Team Moers"]
  },
  {
    title: "Hausbesuch-Aktion Meerbeck",
    description: "Tür-zu-Tür Aktion im Stadtteil Meerbeck",
    location: "Meerbeck",
    startDate: new Date('2024-12-07T14:00:00'),
    endDate: new Date('2024-12-07T18:00:00'),
    type: "Hausbesuch",
    participants: ["Team Meerbeck"]
  }
];

const seedEvents = async () => {
  try {
    // Warte auf Datenbankverbindung
    if (mongoose.connection.readyState !== 1) {
      console.log('Warte auf Datenbankverbindung...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Starte Seed-Prozess...');
    
    // Lösche alle existierenden Events
    const deleteResult = await Event.deleteMany({});
    console.log('Alte Events gelöscht:', deleteResult);

    // Füge neue Events hinzu
    const result = await Event.insertMany(demoEvents);
    console.log('Demo-Events wurden erstellt:', result);

    // Überprüfe die erstellten Events
    const count = await Event.countDocuments();
    console.log(`Anzahl Events in der Datenbank: ${count}`);

    return result;
  } catch (error) {
    console.error('Fehler beim Erstellen der Demo-Events:', error);
    throw error;
  }
};

// Exportiere sowohl die Funktion als auch die Demo-Events für Tests
module.exports = {
  seedEvents,
  demoEvents
};
