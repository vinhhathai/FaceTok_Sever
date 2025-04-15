'use strict';
//----------------------------------------------------------------
const Joi = require('joi');

const changePasswordValidation = Joi.object({
    currentPassword: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'Mật khẩu hiện tại không được để trống',
        'string.min': 'Mật khẩu hiện tại phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu hiện tại không được vượt quá {#limit} ký tự',
        'any.required': 'Mật khẩu hiện tại là bắt buộc'
    }),
    newPassword: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'Mật khẩu mới không được để trống',
        'string.min': 'Mật khẩu mới phải có ít nhất {#limit} ký tự',
        'string.max': 'Mật khẩu mới không được vượt quá {#limit} ký tự',
        'any.required': 'Mật khẩu mới là bắt buộc'
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
        'string.empty': 'Xác nhận mật khẩu mới không được để trống',
        'any.only': 'Xác nhận mật khẩu mới không khớp',
        'any.required': 'Xác nhận mật khẩu mới là bắt buộc'
    })
});

module.exports = changePasswordValidation; 