'use strict';
//----------------------------------------------------------------
const signUpValidation = require("../../validation/signUpValidation")
const UserModel = require("../../models/UserModel")
const bcrypt = require('bcrypt');
const moment = require('moment');
const { errorCode, errorMessage } = require('../../common/enum/error')


exports.signUp = async (req, res) => {
    try {
        // Validation
        const { error } = signUpValidation.validate(req.body)
        if (error) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: "/auth/sign-up",
                code: errorCode.VALIDATION_FAILED,
                error: {
                    name: error.message,
                }

            })
        }

        // Check email and username in database
        const { email, fullName } = req.body;
        const emailExist = await UserModel.findOne({ email });
        if (emailExist) {
            return res.status(409).json({
                timestamp: new Date().toISOString(),
                path: "/auth/sign-up",
                code: errorCode.DATA_CONFLICT,
                error: {
                    name: errorMessage.EMAIL_EXISTED,
                }

            });
        }

       

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Insert account into database
        const newUser = await UserModel.create({
            ...req.body,
            password: hashedPassword,
        })

        // Response message to client
        newUser.password = undefined;
        return res.status(201).json({
            message: "Account created successfully",
            status: true
        })

    } catch (error) {
        return res.status(500).json({
            timestamp: new Date().toISOString(),
            path: "/auth/sign-up",
            code: errorCode.ERR_CREATE_ACCOUNT_FAILED,
            error: {
                name: error.message,
            }
        });
    }
}
