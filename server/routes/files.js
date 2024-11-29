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
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    const fileData = {
      id: path.parse(req.file.filename).name,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
      path: req.file.path
    };

    // Hier könnte man die Datei-Informationen in einer Datenbank speichern
    
    res.json({
      message: 'Datei erfolgreich hochgeladen',
      file: fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen der Datei' });
  }
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
