'use strict';
//----------------------------------------------------------------

const Joi = require('joi').extend(require('@joi/date'));;

const emailValidation = Joi.object({
    email: Joi.string().email().required(),
    
});

module.exports = emailValidation;
