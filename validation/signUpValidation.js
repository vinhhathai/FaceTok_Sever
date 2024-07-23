'use strict';
//----------------------------------------------------------------
const Joi = require('joi').extend(require('@joi/date'));;

const signUpValidation = Joi.object({
    username: Joi.string().required().min(6).max(255),
    password: Joi.string().required().min(6).max(255),
    confirmPassword: Joi.string().required().min(6).max(255).valid(Joi.ref("password")),
    email: Joi.string().email().required(),
    birthday: Joi.date().format('DD-MM-YYYY').utc().required()
    
});

module.exports = signUpValidation;
