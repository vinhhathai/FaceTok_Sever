"use strict";
//----------------------------------------------------------------
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Send reset password email with OTP
 * @param {String} email - Recipient email
 * @param {String} otp - One-time password
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendResetPasswordEmail = async (email, otp) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Email options
        const mailOptions = {
            from: `"FaceTok Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <h1>Reset Your Password</h1>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>The code will expire in 10 minutes.</p>
            `
        };
        
        // Send email
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Send email error:', error);
        throw error;
    }
};

module.exports = sendResetPasswordEmail; 