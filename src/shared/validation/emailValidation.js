'use strict';
//----------------------------------------------------------------
const Joi = require('joi');

const emailValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    })
});

module.exports = emailValidation; 