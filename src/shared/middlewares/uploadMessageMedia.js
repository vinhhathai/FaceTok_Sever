'use strict';
//----------------------------------------------------------------
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${file.mimetype}`), false);
  }
};

// Multer configuration
const uploadMessageMedia = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 5, // Maximum 5 files per message
  },
  fileFilter: fileFilter,
});

// Middleware to handle multiple media files
const messageMediaArray = uploadMessageMedia.array('media', 5);

// Error handling wrapper
const handleMediaUpload = (req, res, next) => {
  messageMediaArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 50MB per file.',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 5 files per message.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading files',
      });
    }
    next();
  });
};

module.exports = {
  handleMediaUpload,
  uploadMessageMedia,
};
