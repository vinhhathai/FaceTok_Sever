const Joi = require('joi');

const emailValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
    'string.empty': 'Email không được để trống'
  })
});

const resetPasswordValidation = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
    'string.empty': 'Mật khẩu mới không được để trống'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'any.required': 'Mật khẩu xác nhận là bắt buộc',
    'string.empty': 'Mật khẩu xác nhận không được để trống'
  })
});

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
    'string.empty': 'Email không được để trống'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
    'string.empty': 'Mật khẩu không được để trống'
  })
});

const signUpValidation = Joi.object({
  fullName: Joi.string().required().messages({
    'any.required': 'Họ tên là bắt buộc',
    'string.empty': 'Họ tên không được để trống'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
    'string.empty': 'Email không được để trống'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
    'string.empty': 'Mật khẩu không được để trống'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'any.required': 'Mật khẩu xác nhận là bắt buộc',
    'string.empty': 'Mật khẩu xác nhận không được để trống'
  }),
  
});

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Mật khẩu hiện tại là bắt buộc',
    'string.empty': 'Mật khẩu hiện tại không được để trống'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
    'string.empty': 'Mật khẩu mới không được để trống'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'any.required': 'Mật khẩu xác nhận là bắt buộc',
    'string.empty': 'Mật khẩu xác nhận không được để trống'
  })
});

const otpVerificationValidation = Joi.object({
  email: Joi.string().required().messages({
    'any.required': 'Email là bắt buộc',
    'string.empty': 'Email không được để trống'
  }),
  otp: Joi.alternatives().try(
    Joi.string().pattern(/^\d{6}$/).messages({
      'string.pattern.base': 'OTP phải là 6 chữ số'
    }),
    Joi.number().integer().min(100000).max(999999).messages({
      'number.min': 'OTP phải là 6 chữ số',
      'number.max': 'OTP phải là 6 chữ số',
      'number.integer': 'OTP phải là số nguyên'
    })
  ).required().messages({
    'any.required': 'OTP là bắt buộc'
  })
});

const passwordResetWithTokenValidation = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
    'string.empty': 'Mật khẩu mới không được để trống'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'any.required': 'Mật khẩu xác nhận là bắt buộc',
    'string.empty': 'Mật khẩu xác nhận không được để trống'
  })
});

module.exports = {
  emailValidation,
  resetPasswordValidation,
  loginValidation,
  signUpValidation,
  changePasswordValidation,
  otpVerificationValidation,
  passwordResetWithTokenValidation
}; 