'use strict';
//----------------------------------------------------------------
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendResetPasswordEmail(nameHostEmail, receivedEmail, otp) {
    const hostMail = process.env.HOST_MAIL;
    const passHostMail = process.env.EMAIL_PASS;
    let transporter = nodemailer.createTransport({
        service: 'Gmail', // Gmail, Yahoo,...
        auth: {
            user: hostMail,
            pass: passHostMail,
        },
    });


    await transporter.sendMail({
        from: `"${nameHostEmail}" <${hostMail}>`,
        to: receivedEmail,
        subject: 'Reset Password From Facetok',
        html: `
            Hi ${receivedEmail},
            <br><br>
            There was a request to change your password!
            <br><br>
            If you did not make this request then please ignore this email.
            <br><br>
            Otherwise, please enter this code to change your password: <h1>${otp}</h1>
        `,
    });

}

module.exports = sendResetPasswordEmail;
