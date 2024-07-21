'use strict';
//----------------------
const bcrypt = require('bcrypt')
const UserModel = require("../models/UserModel");
const emailValidation = require("../validation/emailValidation");
const jwt = require('jsonwebtoken');
const changePasswordValidation = require("../validation/changePasswordValidation");
require('dotenv').config()
const sendResetPasswordEmail = require = require('../utils/sendResetPasswordEmail')

// Send a reset password email
exports.resetPassword = async (req, res, next) => {
    // Validation
    try {
        const { error } = await emailValidation.validate(req.body)
        if (error) {
            console.log(error);
            return res.status(400).json({ error });
        }
        // Get email for sending
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email });
        // Create token
        if (user) {
            const resetPasswordToken = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: 120 })
            console.log(resetPasswordToken)
            // Setup link for reset password
            const host = "localhost:9999"
            console.log(host)
            const protocol = req.protocol
            console.log(protocol)
            const resetLink = `${protocol}://${host}/reset-password?token=${resetPasswordToken}&email=${email}`
            console.log(resetLink)
            const hostMail = process.env.EMAIL_USER;
            const passHostMail = process.env.EMAIL_PASS;
            // Send email
            try {
                sendResetPasswordEmail('Facetok', hostMail, passHostMail, email, resetLink)
                return res.json({
                    success: true,
                    message: `Reset password link has been sent to ${email}`
                })
            } catch (error) {
                console.log(error)
                return res.json({
                    errorName: error.name,
                    errorMessage: error.message
                });

            }

        }

        return res.json({ success: false, errorMessage: "Email is not exist system." });
    } catch (error) {
        console.error(error);
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }

    // user nhập email và gửi
    // hệ thống check email đúng thì tạo token + gửi mail reset đến user
    // user ấn link reset trong mail
    // user nhập mật khẩu mới
    // hệ thống update mật khẩu mới
}
/*TEST */
// exports.changePassword = async (req, res, next) => {
//     const newPassword = "1234567"
//     const confirmNewPassword = "1234567"
//     const token = req.query.token
//     const email = req.query.email

//     return res.json({
//         newPassword,
//         confirmNewPassword,
//         token,
//         email,

//     })
// }

// Handle changing password request from client
exports.changePassword = async (req, res, next) => {
    const { newPassword } = req.body
    const { confirmNewPassword } = req.body
    const { token } = req.body
    const { email } = req.body
    // check valid
    try {
        const { error } = await changePasswordValidation.validate({ newPassword, confirmNewPassword })
        if (error) {
            console.log(error);
            return res.status(400).json({ error });
        }
        // check expiration of token
        // verify 
        const resetToken = await jwt.verify(token, process.env.SECRET_KEY)
        if (!resetToken) {
            return res.status(403).json({
                message: "Error verifying access token"
            })
        }
        // check user and change password
        const user = await UserModel.findOne({ email: email })
        if (user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await UserModel.findOneAndUpdate({ email: email }, { password: hashedPassword })
            return res.json({

                success: true,
                message: "Change password successfully"
            })
        }
        return res.status(403).json({ success: false, message: "User is not found!" })
    } catch (error) {
        console.error(error);
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }

}