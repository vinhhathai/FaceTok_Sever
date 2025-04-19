"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

// Validation schema cho cập nhật fullname
const fullnameUpdateValidation = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Họ tên không được để trống',
    'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
    'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
    'any.required': 'Họ tên là bắt buộc'
  })
});

module.exports = {
  fullnameUpdateValidation
}; 