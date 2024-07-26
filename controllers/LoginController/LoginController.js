'use strict';
//----------------------------------------------------------------
const loginValidation = require("../../validation/loginValidation");
const UserModel = require("../../models/UserModel")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { errorCode, errorMessage } = require('../../common/enum/error')
require('dotenv').config()

exports.loginToSystem = async (req, res) => {

    // Validation
    try {
        const { error } =  await loginValidation.validate(req.body);

        if (error) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/auth/login",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: error.message,
                }
            });
        }

        // Check username in database
        const { username } = req.body;
        const usernameExist = await UserModel.findOne({ username });

        if (!usernameExist) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/auth/login",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.DATA_NOT_FOUND
                }
            });
        }

        // Decode and Check pasword
        const checkPassword = await bcrypt.compare(req.body.password, usernameExist.password)
        if (!checkPassword) {
            return res.status(404).json({
                timestamp: new Date().toISOString(),
                path: "/auth/login",
                code: errorCode.DATA_NOT_FOUND,
                error: {
                    name: errorMessage.DATA_NOT_FOUND
                }
            });
        }

        // Check isActive account
        const isActive = usernameExist.isActive
        console.log(isActive)
        if (!isActive) {
            return res.status(403).json({
                timestamp: new Date().toISOString(),
                path: "/auth/login",
                code: errorCode.ACCOUNT_IS_BANNED,
                error: {
                    name: errorMessage.ACCOUNT_IS_BANNED
                }
            });
        }

        // Create jwt token
        const accessToken = jwt.sign({ _id: usernameExist._id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '7d' }) // 5 minutes
        const refreshToken = jwt.sign({ _id: usernameExist._id }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' }); // 7 days

        // If everything is okay, return success message
        usernameExist.password = undefined
        return res.status(200).json({
            message: 'Login successfully',
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        returnres.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/auth/login",
            code: errorCode.ERR_LOGIN_FAILED,
            error: {
                name: error.message,
            }
        });
    }
};
