"use strict";
//----------------------------------------------------------------
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const sharp = require('sharp');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload buffer to Cloudinary using streams
 * @param {Buffer} buffer - The file buffer from multer
 * @param {Object} options - Upload options including folder, transformation, etc.
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        
        // Create a stream from the buffer and pipe to Cloudinary
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Process image with Sharp and upload to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer.memoryStorage
 * @param {String} folder - Cloudinary folder to upload to
 * @param {Object} imageOptions - Image processing options for Sharp
 * @param {Object} uploadOptions - Additional Cloudinary upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const processAndUploadImage = async (fileBuffer, folder = 'chaotok/thumbnails', imageOptions = {}, uploadOptions = {}) => {
    try {
        // Default image processing options
        const defaultImageOptions = {
            quality: 80,
            width: 1200,
            height: 400,
            fit: 'inside',
            format: 'jpeg',
            ...imageOptions
        };
        
        // Process image with sharp
        let processedBuffer;
        const sharpInstance = sharp(fileBuffer);
        
        // Apply resize if width or height provided
        if (defaultImageOptions.width || defaultImageOptions.height) {
            sharpInstance.resize({
                width: defaultImageOptions.width,
                height: defaultImageOptions.height,
                fit: defaultImageOptions.fit,
                withoutEnlargement: true
            });
        }
        
        // Convert to specified format and set quality
        switch(defaultImageOptions.format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                processedBuffer = await sharpInstance.jpeg({ quality: defaultImageOptions.quality }).toBuffer();
                break;
            case 'png':
                processedBuffer = await sharpInstance.png({ quality: defaultImageOptions.quality }).toBuffer();
                break;
            case 'webp':
                processedBuffer = await sharpInstance.webp({ quality: defaultImageOptions.quality }).toBuffer();
                break;
            case 'avif':
                processedBuffer = await sharpInstance.avif({ quality: defaultImageOptions.quality }).toBuffer();
                break;
            default:
                processedBuffer = await sharpInstance.jpeg({ quality: defaultImageOptions.quality }).toBuffer();
        }
        
        // Upload to Cloudinary
        const mergedOptions = {
            folder,
            resource_type: 'image',
            ...uploadOptions
        };
        
        return await uploadBufferToCloudinary(processedBuffer, mergedOptions);
    } catch (error) {
        console.error('Image processing or upload error:', error);
        throw error;
    }
};

/**
 * Upload file to Cloudinary (legacy function maintained for backward compatibility)
 * @param {String} file - Base64 encoded file or file path
 * @param {String} folder - Folder to upload to
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (file, folder = 'chaotok', options = {}) => {
    try {
        const uploadOptions = { folder, ...options };
        return await cloudinary.uploader.upload(file, uploadOptions);
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

module.exports = {
    processAndUploadImage,
    uploadToCloudinary,
    uploadBufferToCloudinary
}; 