'use strict';
//----------------------------------------------------------------
const Joi = require('joi');

const resetPasswordValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    }),
    otp: Joi.string().required().length(6).messages({
        'string.empty': 'OTP không được để trống',
        'string.length': 'OTP phải có {#limit} ký tự',
        'any.required': 'OTP là bắt buộc'
    }),
    newPassword: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'Mật khẩu mới không được để trống',
        'string.min': 'Mật khẩu mới phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu mới không được vượt quá {#limit} ký tự',
        'any.required': 'Mật khẩu mới là bắt buộc'
    })
});

module.exports = resetPasswordValidation; 