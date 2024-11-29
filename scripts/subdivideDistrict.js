const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

// Exakte Koordinaten des Wahlkreises 113 (Krefeld III - Viersen III)
const district113Coordinates = [
  [6.600767019048215, 51.52361822285865],
  [6.602124692227695, 51.522556725946366],
  [6.605787326360721, 51.52278097898384],
  [6.614365650337355, 51.514776000390135],
  [6.616734027537709, 51.512385653833924],
  [6.629491631246077, 51.4194354518142],
  [6.624857392246077, 51.4094354518142],
  [6.598295258272745, 51.341265728119204],
  [6.578295258272745, 51.339265728119204],
  [6.558295258272745, 51.340265728119204],
  [6.515314169309483, 51.3409661256475],
  [6.515562219149106, 51.42599723579696],
  [6.525562219149106, 51.43599723579696],
  [6.5447648173209165, 51.47685480580023],
  [6.600767019048215, 51.52361822285865]
];

function generateSubDistricts() {
  const mainPolygon = turf.polygon([district113Coordinates]);
  const bbox = turf.bbox(mainPolygon);
  const subDistricts = [];
  
  // Teile den Bereich in ein 4x3 Gitter
  const numRows = 3;
  const numCols = 4;
  
  const width = (bbox[2] - bbox[0]) / numCols;
  const height = (bbox[3] - bbox[1]) / numRows;
  
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      // Erstelle ein rechteckiges Polygon für jeden Gitterbereich
      const cellCoords = [
        [
          bbox[0] + col * width,
          bbox[1] + row * height
        ],
        [
          bbox[0] + (col + 1) * width,
          bbox[1] + row * height
        ],
        [
          bbox[0] + (col + 1) * width,
          bbox[1] + (row + 1) * height
        ],
        [
          bbox[0] + col * width,
          bbox[1] + (row + 1) * height
        ],
        [
          bbox[0] + col * width,
          bbox[1] + row * height
        ]
      ];
      
      const cellPolygon = turf.polygon([cellCoords]);
      
      try {
        // Schneide mit dem Hauptdistrikt
        const intersection = turf.intersect(mainPolygon, cellPolygon);
        
        if (intersection && turf.area(intersection) > 0) {
          const area = turf.area(intersection);
          const totalHouses = Math.floor(area / 8000) + 80; // Basis: 1 Haus pro 8.000 m²
          
          const subDistrict = {
            id: `113-${row * numCols + col + 1}`,
            name: `Bezirk ${row * numCols + col + 1}`,
            geometry: intersection.geometry,
            totalHouses,
            visitedHouses: 0,
            status: 'not_started',
            assignedTeam: null,
            notes: ''
          };
          
          subDistricts.push(subDistrict);
        }
      } catch (e) {
        console.log(`Fehler beim Verarbeiten von Bezirk ${row * numCols + col + 1}:`, e.message);
      }
    }
  }
  
  return subDistricts;
}

// Generiere die Unterdistrikte
const subDistricts = generateSubDistricts();

// Erstelle die Distriktdaten
const districtData = {
  districtId: '113',
  name: 'Wahlkreis 113 - Krefeld III - Viersen III',
  geometry: turf.polygon([district113Coordinates]).geometry,
  subDistricts: subDistricts,
  totalProgress: 0
};

// Speichere die Daten
const outputPath = path.join(__dirname, '../server/data/district113.json');
fs.writeFileSync(outputPath, JSON.stringify(districtData, null, 2));

console.log(`Wahlkreis wurde in ${subDistricts.length} Unterdistrikte aufgeteilt.`);
console.log(`Daten wurden gespeichert in: ${outputPath}`);
