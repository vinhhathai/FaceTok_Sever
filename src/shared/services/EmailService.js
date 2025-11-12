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
                from: `"Chaotok Support" <${process.env.EMAIL_USER || process.env.HOST_MAIL}>`,
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
                from: `"Chaotok Support" <${process.env.EMAIL_USER || process.env.HOST_MAIL}>`,
                to: email,
                subject: 'Verify Your Email - Chaotok',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #4ECDC4; padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">Welcome to Chaotok!</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p>Hi ${fullName || 'there'},</p>
                            <p>Thank you for registering with Chaotok! To complete your registration, please verify your email address.</p>
                            <p>Your verification code is:</p>
                            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
                                ${otp}
                            </div>
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            <p>If you didn't create an account on Chaotok, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                © 2025 Chaotok. All rights reserved.
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

    /**
     * Send custom email from admin to user
     * @param {String} email - Recipient email
     * @param {String} subject - Email subject
     * @param {String} message - Email message (can include HTML)
     * @param {String} fullName - User's full name
     */
    static async sendAdminEmail(email, subject, message, fullName = '') {
        try {
            const transporter = this._createTransporter();
            
            const mailOptions = {
                from: `"Chaotok Admin" <${process.env.EMAIL_USER || process.env.HOST_MAIL}>`,
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #4ECDC4 0%, #3AB0A8 100%); padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">📧 Message from Chaotok Admin</h1>
                        </div>
                        <div style="padding: 30px; background-color: #ffffff;">
                            <p style="font-size: 16px; color: #333;">Hi ${fullName || 'there'},</p>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4ECDC4;">
                                <div style="font-size: 15px; line-height: 1.6; color: #333; white-space: pre-wrap;">${message}</div>
                            </div>
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                This is an official message from the Chaotok administration team. If you have any questions, please reply to this email.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                © 2025 Chaotok. All rights reserved.
                            </p>
                        </div>
                    </div>
                `
            };
            
            return await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Send admin email error:', error);
            throw error;
        }
    }
}

module.exports = EmailService; 