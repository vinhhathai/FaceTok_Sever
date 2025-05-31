"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

// Validation schema for fullname update
const fullnameUpdateValidation = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Fullname cannot be empty',
    'string.min': 'Fullname must be at least {#limit} characters long',
    'string.max': 'Fullname cannot exceed {#limit} characters',
    'any.required': 'Fullname is required'
  })
});

module.exports = {
  fullnameUpdateValidation
}; 