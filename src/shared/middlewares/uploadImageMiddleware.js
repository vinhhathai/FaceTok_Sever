const multer = require('multer');

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

// Middleware for different types of uploads
const uploadImageMiddleware = {
  // For single image upload
  single: (fieldName = 'image') => imageUpload.single(fieldName),
  
  // For multiple images upload (max 5 files)
  multiple: (fieldName = 'images', maxCount = 5) => imageUpload.array(fieldName, maxCount),
  
  // For different fields with different counts
  fields: (fields) => imageUpload.fields(fields),
  
  // For profile picture upload
  profilePicture: imageUpload.single('profilePicture'),
  
  // For cover photo upload
  coverPhoto: imageUpload.single('coverPhoto'),
  
  // For post images upload (max 10)
  postImages: imageUpload.array('postImages', 10),
};

module.exports = uploadImageMiddleware; 