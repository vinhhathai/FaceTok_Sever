"use strict";
//----------------------------------------------------------------
const Joi = require("joi");

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().required().min(6).max(255).messages({
    'string.empty': 'Mật khẩu không được để trống',
    'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
    'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  })
});

module.exports = loginValidation; 