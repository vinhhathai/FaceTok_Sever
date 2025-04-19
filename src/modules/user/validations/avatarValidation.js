"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

// Validation schema cho cập nhật avatar
const avatarUpdateValidation = Joi.object({
  avatarUrl: Joi.string().required().messages({
    'string.empty': 'URL avatar không được để trống',
    'any.required': 'URL avatar là bắt buộc'
  })
});

module.exports = {
  avatarUpdateValidation
}; 