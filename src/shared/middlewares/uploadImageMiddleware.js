const multer = require('multer');
const { errorCode } = require('../common/error');

// Configure multer memory storage (files stored in memory as Buffer objects)
const memStorage = multer.memoryStorage();

// File type validation
const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Không hỗ trợ định dạng file này. Vui lòng sử dụng JPEG, PNG, GIF hoặc WEBP.'), false);
  }
};

// Create multer upload instances for different use cases
const imageUpload = multer({
  storage: memStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Error handling wrapper for multer middleware
const handleMulterError = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        // Handle Multer errors with consistent format
        return res.status(400).json({
          success: false,
          error: {
            code: errorCode.VALIDATION_FAILED,
            message: err.message || 'Lỗi khi tải lên tệp'
          },
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
      next();
    });
  };
};

// Middleware for different types of uploads
const uploadImageMiddleware = {
  // For single image upload
  single: (fieldName = 'image') => handleMulterError(imageUpload.single(fieldName)),
  
  // For multiple images upload (max 5 files)
  multiple: (fieldName = 'images', maxCount = 5) => handleMulterError(imageUpload.array(fieldName, maxCount)),
  
  // For different fields with different counts
  fields: (fields) => handleMulterError(imageUpload.fields(fields)),
  
  // For profile picture upload
  profilePicture: handleMulterError(imageUpload.single('profilePicture')),
  
  // For cover photo upload
  coverPhoto: handleMulterError(imageUpload.single('coverPhoto')),
  
  // For post images upload (max 10)
  postImages: handleMulterError(imageUpload.array('postImages', 10)),
};

module.exports = uploadImageMiddleware; 