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

module.exports = {
    generateOTPCode,
}; 