const Joi = require('joi');

const emailValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty'
  })
});

const resetPasswordValidation = Joi.object({
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'New password is required',
    'string.empty': 'New password cannot be empty'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password does not match',
    'any.required': 'Confirm password is required',
    'string.empty': 'Confirm password cannot be empty'
  })
});

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty'
  })
});

const signUpValidation = Joi.object({
  fullName: Joi.string().required().messages({
    'any.required': 'Full name is required',
    'string.empty': 'Full name cannot be empty'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password does not match',
    'any.required': 'Confirm password is required',
    'string.empty': 'Confirm password cannot be empty'
  }),
  
});

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
    'string.empty': 'Current password cannot be empty'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required',
    'string.empty': 'New password cannot be empty'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password does not match',
    'any.required': 'Confirm password is required',
    'string.empty': 'Confirm password cannot be empty'
  })
});

const otpVerificationValidation = Joi.object({
  email: Joi.string().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty'
  }),
  otp: Joi.alternatives().try(
    Joi.string().pattern(/^\d{6}$/).messages({
      'string.pattern.base': 'OTP must be 6 digits'
    }),
    Joi.number().integer().min(100000).max(999999).messages({
      'number.min': 'OTP must be 6 digits',
      'number.max': 'OTP must be 6 digits',
      'number.integer': 'OTP must be an integer'
    })
  ).required().messages({
    'any.required': 'OTP is required'
  })
});

const passwordResetWithTokenValidation = Joi.object({

  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'New password is required',
    'string.empty': 'New password cannot be empty'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password does not match',
    'any.required': 'Confirm password is required',
    'string.empty': 'Confirm password cannot be empty'
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