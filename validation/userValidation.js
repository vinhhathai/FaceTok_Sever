const Joi = require('joi');

const userValidation = Joi.object({
    username: Joi.string().required().min(6).max(255),
    password: Joi.string().required().min(6).max(255),
    confirmPassword: Joi.string().required().min(6).max(255).valid(Joi.ref("password")),
    email: Joi.string().email().required(),
    birthday: Joi.date().required()
    
});

module.exports = userValidation;
