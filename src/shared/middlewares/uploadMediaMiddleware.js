const multer = require('multer');

const memStorage = multer.memoryStorage();

const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Unsupported file type'), false);
};

const upload = multer({
  storage: memStorage,
  fileFilter,
  limits: {
    // Set generous limits; video may be large
    fileSize: 50 * 1024 * 1024 // 50MB per file
  }
});

module.exports = {
  mediaArray: (fieldName = 'media', maxCount = 5) => (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Upload error' });
      }
      next();
    });
  }
};
