const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    /**
     * Tạo nodemailer transporter
     * @private
     */
    static _createTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || process.env.HOST_MAIL,
                pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
            }
        });
    }

    /**
     * Send password reset email with OTP
     * @param {String} email - Recipient email
     * @param {String} otp - One-time password
     */
    static async sendPasswordResetEmail(email, otp) {
        try {
            const transporter = this._createTransporter();
            
            const mailOptions = {
                from: `"FaceTok Support" <${process.env.EMAIL_USER || process.env.HOST_MAIL}>`,
                to: email,
                subject: 'Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #4ECDC4;">Reset Your Password</h1>
                        <p>Your verification code is:</p>
                        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>The code will expire in 10 minutes.</p>
                        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            };
            
            return await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Send password reset email error:', error);
            throw error;
        }
    }

    /**
     * Send email verification OTP when user registers
     * @param {String} email - Recipient email
     * @param {String} otp - Verification OTP
     * @param {String} fullName - User's full name
     */
    static async sendVerificationEmail(email, otp, fullName = '') {
        try {
            const transporter = this._createTransporter();
            
            const mailOptions = {
                from: `"FaceTok Support" <${process.env.EMAIL_USER || process.env.HOST_MAIL}>`,
                to: email,
                subject: 'Verify Your Email - FaceTok',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #4ECDC4; padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">Welcome to FaceTok!</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p>Hi ${fullName || 'there'},</p>
                            <p>Thank you for registering with FaceTok! To complete your registration, please verify your email address.</p>
                            <p>Your verification code is:</p>
                            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
                                ${otp}
                            </div>
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            <p>If you didn't create an account on FaceTok, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                © 2025 FaceTok. All rights reserved.
                            </p>
                        </div>
                    </div>
                `
            };
            
            return await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Send verification email error:', error);
            throw error;
        }
    }
}

module.exports = EmailService; 