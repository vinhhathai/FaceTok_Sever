const { json } = require("express")
const userValidation = require("../validation/userValidation")
const UserModel = require("../models/UserModel")

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

        // Insert account into database

        // Response message to client

    } catch (error) {
        return res.status(500).json(error)
    }
}
