"use strict";
//----------------------------------------------------------------
const crypto = require('crypto');

/**
 * Generate random OTP with specified length
 * @param {Number} length - Length of OTP (default: 6)
 * @returns {String} OTP code
 */
const generateOTPCode = (length = 6) => {
    // Generate random digits
    const digits = '0123456789';
    let OTP = '';
    
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    
    return OTP;
};

/**
 * Generate a cryptographically secure OTP with specified length
 * @param {Number} length - Length of OTP (default: 6)
 * @returns {String} Secure OTP code
 */
const generateSecureOTP = (length = 6) => {
    // Get max number for the specified length
    const max = Math.pow(10, length) - 1;
    // Get random value in range 0 - max
    const randomNumber = crypto.randomInt(0, max);
    // Format with leading zeros if needed
    return randomNumber.toString().padStart(length, '0');
};

module.exports = {
    generateOTPCode,
    generateSecureOTP
}; 