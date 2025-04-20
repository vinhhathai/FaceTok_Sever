"use strict";
//----------------------------------------------------------------
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {String} file - Base64 encoded file or file path
 * @param {String} folder - Folder to upload to
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (file, folder = 'facetok', options = {}) => {
    try {
        // Check if file is base64
        const isBase64 = file.startsWith('data:');
        
        // Set upload options
        const uploadOptions = {
            folder,
            ...options
        };
        
        if (isBase64) {
            // Upload base64 file
            return await cloudinary.uploader.upload(file, uploadOptions);
        } else {
            // Upload file from path
            return await cloudinary.uploader.upload(file, uploadOptions);
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

module.exports = uploadToCloudinary; 