'use strict';
//----------------------------------------------------------------
const Joi = require('joi').extend(require('@joi/date'));;

const passwordValidation = Joi.object({
    newPassword: Joi.string().required().min(6).max(255),
    confirmNewPassword: Joi.string().required().min(6).max(255).valid(Joi.ref("newPassword")),
   
    
});

module.exports = passwordValidation;
