const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendResetPasswordEmail( nameHostEmail, hostMail, passHostMail, receivedEmail, resetLink) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail', // Bạn có thể sử dụng các dịch vụ email khác như Yahoo, Outlook, etc.
        auth: {
            user: hostMail,
            pass: passHostMail,
        },
    });
    const hostEmail = process.env.EMAIL_USER;

    let info = await transporter.sendMail({
        from: `"${nameHostEmail}" <${hostEmail}>`,
        to: receivedEmail,
        subject: 'Reset Password From Facetok',
        html: `
            Hi ${receivedEmail},
            <br><br>
            There was a request to change your password!
            <br><br>
            If you did not make this request then please ignore this email.
            <br><br>
            Otherwise, please click this link to change your password: <a href="${resetLink}">LINK</a>
        `,
    });

    console.log('Message sent: %s', info.messageId);
}

module.exports = sendResetPasswordEmail;
