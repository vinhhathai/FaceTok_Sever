'use strict';
//----------------------------------------------------------------
const multer = require('multer');
const path = require('path');
const { errorCode, errorMessage } = require('../common/enum/error')

// Use memory storage for Firebase uploads
const storage = multer.memoryStorage();

// Filter to check file type
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: File type not supported'));
    }
};

// Create multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: fileFilter
});

// Middleware to handle multer errors
function handleMulterError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(413).json({
            timestamp: new Date().toISOString(),
            path: "/upload/",
            code: errorCode.FILE_EXCEEDED_SIZE,
            error: {
                name: errorMessage.FILE_EXCEEDED_SIZE
            }
        });
    } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(415).json({
            timestamp: new Date().toISOString(),
            path: "/upload/",
            code: errorCode.UPLOAD_FILE_FAILED,
            error: {
                name: err.message,
            }
        });
    }
    // Everything went fine.
    next();
}

module.exports = {
    upload,
    handleMulterError
};
