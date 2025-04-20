const Joi = require('joi');

const markNotificationReadValidation = Joi.object({
  notificationId: Joi.string().required().messages({
    'any.required': 'ID thông báo là bắt buộc',
    'string.empty': 'ID thông báo không được để trống'
  })
});

module.exports = {
  markNotificationReadValidation
}; 