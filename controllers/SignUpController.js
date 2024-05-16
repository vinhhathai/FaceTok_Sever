const { json } = require("express")
const userValidation = require("../validation/userValidation")
const UserModel = require("../models/UserModel")
const bcrypt = require('bcrypt');
const moment = require('moment');

exports.signUp = async (req, res, next) => {
    try {
        // Validation
        const { error } = userValidation.validate(req.body)
        if (error) {
            return res.status(400).json({
                message: error.message
            })
        }



        // Check email and username in database
        const { email, username } = req.body;
        const emailExist = await UserModel.findOne({ email });
        if (emailExist) {

            return res.status(400).json({
                message: "Email already exist"
            });
        }

        const usernameExist = await UserModel.findOne({ username });
        if (usernameExist) {
            return res.status(400).json({
                message: "Username already exist"
            });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Insert account into database
        const { birthday } = req.body;
        const newUser = await UserModel.create({
            ...req.body,
            birthday: moment(birthday, "DD/MM/YYYY").format(
                "YYYY-MM-DD"
            ),
            password: hashedPassword,
        })


        // Response message to client
        newUser.password = undefined;
        return res.status(201).json({
            message: "Account created successfully",
            user: newUser
        })

    } catch (error) {
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }
}
