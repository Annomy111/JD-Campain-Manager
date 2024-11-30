const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Konfiguriere Multer für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB Limit
  }
});

// Datei-Upload-Route
router.post('/upload', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'File upload functionality is temporarily disabled'
  });
});

// Datei-Download-Route
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Suche die Datei im uploads-Verzeichnis
    const files = fs.readdirSync(uploadsDir);
    const file = files.find(f => f.startsWith(fileId));
    
    if (!file) {
      return res.status(404).json({ error: 'Datei nicht gefunden' });
    }

    const filePath = path.join(uploadsDir, file);
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Fehler beim Herunterladen der Datei' });
  }
});

// Datei löschen
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Suche die Datei im uploads-Verzeichnis
    const files = fs.readdirSync(uploadsDir);
    const file = files.find(f => f.startsWith(fileId));
    
    if (!file) {
      return res.status(404).json({ error: 'Datei nicht gefunden' });
    }

    const filePath = path.join(uploadsDir, file);
    fs.unlinkSync(filePath);

    // Hier könnte man den Datei-Eintrag aus der Datenbank löschen

    res.json({ message: 'Datei erfolgreich gelöscht' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Datei' });
  }
});

module.exports = router;
