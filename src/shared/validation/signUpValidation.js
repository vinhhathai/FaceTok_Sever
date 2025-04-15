'use strict';
//----------------------------------------------------------------
const Joi = require('joi').extend(require('@joi/date'));

const signUpValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không hợp lệ',
        'any.required': 'Email là bắt buộc'
    }),
    fullName: Joi.string().required().min(2).max(100).messages({
        'string.empty': 'Họ tên không được để trống',
        'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
        'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
        'any.required': 'Họ tên là bắt buộc'
    }),
    password: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
        'string.empty': 'Xác nhận mật khẩu không được để trống',
        'any.only': 'Xác nhận mật khẩu không khớp',
        'any.required': 'Xác nhận mật khẩu là bắt buộc'
    })
});

module.exports = signUpValidation; 