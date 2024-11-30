const express = require('express');
const router = express.Router();

// Temporarily disabled file upload functionality
router.post('/upload', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'File upload functionality is temporarily disabled'
  });
});

router.get('/download/:filename', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'File download functionality is temporarily disabled'
  });
});

router.delete('/:filename', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'File deletion functionality is temporarily disabled'
  });
});

module.exports = router;
