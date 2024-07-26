'use strict';
//----------------------------------------------------------------
const bcrypt = require('bcrypt')
const UserModel = require("../../models/UserModel");
const emailValidation = require("../../validation/emailValidation");
const jwt = require('jsonwebtoken');
const changePasswordValidation = require("../../validation/changePasswordValidation");
const { errorMessage, errorCode } = require('../../common/enum/error');
require('dotenv').config()
const sendResetPasswordEmail = require('../../utils/sendResetPasswordEmail')

// Send a reset password email
exports.resetPassword = async (req, res, next) => {
    // Validation
    try {
        const { error } = await emailValidation.validate(req.body)
        if (error) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/auth/reset-password",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: error.message,
                }
            });
        }

        // Get email for sending
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email });
        // Create token
        if (user) {
            const resetPasswordToken = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '2m' }) // 2 minutes
            // Setup link for reset password
            const host = "localhost:3000"
            const protocol = req.protocol
            const resetLink = `${protocol}://${host}/auth/reset-password?reset_password_token=${resetPasswordToken}&email=${email}`

            // Send email
            try {
                sendResetPasswordEmail('Facetok', email, resetLink)
                return res.status(201).json({
                    message: `Reset password link has been sent to ${email}`
                })
            } catch (error) {
                return res.status(401).json({
                    timestamp: new Date().toISOString(),
                    path: "/auth/reset-password",
                    code: errorCode.EMAIL_SERVICE_UNAUTHORIZED,
                    error: {
                        name: errorMessage.EMAIL_SERVICE_UNAUTHORIZED,
                    }
                });

            }

        }

        return res.status(404).json({
            timestamp: new Date().toISOString(),
            path: "/auth/reset-password",
            code: errorCode.EMAIL_NOT_FOUND,
            error: {
                name: errorMessage.EMAIL_NOT_FOUND,
            }
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/auth/reset-password",
            code: errorCode.ERR_GET_RESET_PASSWORD_LINK_FAILED,
            error: {
                name: errorMessage.ERR_GET_RESET_PASSWORD_LINK_FAILED,
            }
        });
    }
}


// Handle changing password request from client
exports.changePassword = async (req, res) => {
    const { newPassword } = req.body
    const { confirmNewPassword } = req.body
    const { resetPasswordToken } = req.body
    const { email } = req.body
    // check validation
    try {
        const { error } = await changePasswordValidation.validate({ newPassword, confirmNewPassword })
        if (error) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/auth/change-password",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: error.message,
                }
            });
        }
        // Verify token
        let token;
        try {
            token = jwt.verify(resetPasswordToken, process.env.SECRET_KEY);
        } catch (error) {
            return res.status(403).json({
                timestamp: new Date().toISOString(),
                path: "/auth/change-password",
                code: errorCode.UNAUTHORIZED,
                error: {
                    name: errorMessage.EXPIRED_TOKEN,
                }
            });
        }
        // check user and change password
        const user = await UserModel.findOne({ email: email })
        if (user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await UserModel.findOneAndUpdate({ email: email }, { password: hashedPassword })
            return res.status(200).json({
                message: "Change password successfully"
            })
        }
        return res.status(404).json({
            timestamp: new Date().toISOString(),
            path: "/auth/change-password",
            code: errorCode.DATA_NOT_FOUND,
            error: {
                name: errorMessage.EMAIL_NOT_FOUND,
            }
        });
    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/auth/change-password",
            code: errorCode.ERR_CHANGE_PASSWORD_FAILED,
            error: {
                name: error.message,
            }
        });
    }

}