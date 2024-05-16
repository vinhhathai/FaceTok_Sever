const UserModel = require('../models/UserModel')
const jwt = require('jsonwebtoken');

require('dotenv').config()

module.exports = checkLogin = async (req, res, next) => {
    try {
        // Check login
        const accessToken = req.headers.authorization?.split(' ')[1]
        console.log(accessToken)
        if (!accessToken) {
            return res.status(403).json(
                {
                    message: "Login is required to access"
                }
            )
        }
        // verify 
        const token = await jwt.verify(accessToken, process.env.SECRET_KEY)
        if (!token) {
            res.status(403).json({
                message: "Error verifying access token"
            })
        }

        // check role
        const user = await UserModel.findById(token._id)

        if (user.role !== "member") {
            return res.status(403).json({
                message: "You don't have permission to access this resource"
            })
        }
        //next

        next();

    } catch (error) {
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        })
    }
} 