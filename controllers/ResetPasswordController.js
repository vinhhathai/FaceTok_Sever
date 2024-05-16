const UserModel = require("../models/UserModel");
const emailValidation = require("../validation/emailValidation");

exports.resetPassword = async (req, res, next) => {
    try {
        const { error } = await emailValidation.validate(req.body)
        if (error) {
            console.log(error);
            return res.status(400).json({ error });
        }

        const { email } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (user) {
            return res.json(user);
        }

        return res.json({ message: "Email is not exist system." });
    } catch (error) {
        console.error(error);
        return res.json({
            errorName: error.name,
            errorMessage: error.message
        });
    }
}