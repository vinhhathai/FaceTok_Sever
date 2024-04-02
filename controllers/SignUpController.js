const { json } = require("express")
const userValidation = require("../validation/userValidation")

exports.singUp =  (req, res,next) => {
    // const test = {
    //     username: "v121k3",
    //     password: "12345",
    //     confirmPassword: "123456",
    //     email: "hamster@gmail.com",
    //     birthday: "12-24-2015",
    // }
    try {
        // Validation
        const {error} = userValidation.validate(req.body)
        if(error) {
            return res.json(error.message)
        }
        // Check email and username in database

        // Hash password

        // Insert account into database

        // Response message to client
       
    } catch (error) {
        return res.json(error)
    }
}

