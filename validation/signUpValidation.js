'use strict';
//----------------------------------------------------------------
const Joi = require('joi').extend(require('@joi/date'));;

const signUpValidation = Joi.object({
    email: Joi.string().email().required(),
    fullName: Joi.string().required().min(2).max(100),
    password: Joi.string().required().min(6).max(255),
    confirmPassword: Joi.string().required().min(6).max(255).valid(Joi.ref("password")),
    birthday: Joi.date().format('DD-MM-YYYY').utc().required()
    
});

module.exports = signUpValidation;
