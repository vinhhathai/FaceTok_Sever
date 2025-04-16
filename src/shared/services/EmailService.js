const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    static async sendPasswordResetEmail(email, otp) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.HOST_MAIL,
                    pass: process.env.EMAIL_PASS
                }
            });
            
            const mailOptions = {
                from: `"FaceTok Support" <${process.env.HOST_MAIL}>`,
                to: email,
                subject: 'Password Reset OTP',
                html: `
                    <h1>Reset Your Password</h1>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>The code will expire in 10 minutes.</p>
                `
            };
            
            return await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Send email error:', error);
            throw error;
        }
    }
}

module.exports = EmailService; 