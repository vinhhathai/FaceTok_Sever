const { json } = require("express")
const loginValidation = require("../validation/loginValidation");
const UserModel = require("../models/UserModel")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.loginToSystem = async (req, res, next) => {

    try {
        const { error } = loginValidation.validate(req.body);

        if (error) {
            console.log(error);
            return res.status(400).json({ error });
        }

        console.log('ok');

        const { username } = req.body;
        // Check username in database
        const usernameExist = await UserModel.findOne({ username });

        if (!usernameExist) {
            return res.status(404).json({
                message: 'Username does not exist'
            })
        }
        
        // Dehash and Check pasword
        const checkPassword = await bcrypt.compare(req.body.password, usernameExist.password)
        console.log(checkPassword)
        if (!checkPassword) {
            return res.status(400).json({
                message: 'Password does not match'
            })
        }

        // Create jwt token
        const accessToken = jwt.sign({ _id: usernameExist._id }, process.env.SECRET_KEY, { expiresIn: 300 })
        console.log("token: " + accessToken)

        // If everything is okay, return success message
        usernameExist.password = undefined
        return res.status(200).json({
            message: 'Login successfully',
            user: usernameExist,
            token: accessToken
        });
    } catch (error) {
        console.error(error);
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }
};
