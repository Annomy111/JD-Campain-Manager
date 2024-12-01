const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all files
router.get('/', (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Error reading files directory',
        error: err
      });
    }

    const fileList = files.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    res.json(fileList);
  });
});

// Upload file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      status: 'error',
      message: 'No file uploaded'
    });
  }

  res.json({ 
    status: 'success',
    message: 'File uploaded successfully',
    file: {
      name: req.file.filename,
      size: req.file.size,
      createdAt: new Date()
    }
  });
});

// Download file
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      status: 'error',
      message: 'File not found'
    });
  }

  res.download(filePath);
});

// Delete file
router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      status: 'error',
      message: 'File not found'
    });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Error deleting file',
        error: err
      });
    }

    res.json({ 
      status: 'success',
      message: 'File deleted successfully'
    });
  });
});

module.exports = router;
