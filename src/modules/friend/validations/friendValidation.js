const Joi = require('joi');

const friendRequestValidation = Joi.object({
  targetUserId: Joi.string().required().messages({
    'any.required': 'ID người dùng đích là bắt buộc',
    'string.empty': 'ID người dùng đích không được để trống'
  })
});

module.exports = {
  friendRequestValidation
}; 