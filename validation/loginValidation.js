'use strict';
//----------------------------------------------------------------
const Joi = require('joi')

const loginValidation = Joi.object({
    username: Joi.string().required().min(6).max(255),
    password: Joi.string().required().min(6).max(255),
    
});

module.exports = loginValidation;
