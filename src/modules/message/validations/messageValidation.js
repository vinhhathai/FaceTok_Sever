const Joi = require('joi');

const sendMessageValidation = Joi.object({
  receiverId: Joi.string().required().messages({
    'any.required': 'Receiver ID is required',
    'string.empty': 'Receiver ID cannot be empty'
  }),
  content: Joi.string().required().max(1000).messages({
    'string.max': 'Message content cannot exceed 1000 characters',
    'any.required': 'Message content is required',
    'string.empty': 'Message content cannot be empty'
  }),
  type: Joi.string().valid('text', 'image', 'file').default('text').messages({
    'any.only': 'Message type must be one of: text, image, file'
  })
});

module.exports = {
  sendMessageValidation
};