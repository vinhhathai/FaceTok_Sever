const Joi = require('joi');

const createDirectRoomValidation = Joi.object({
  targetUserId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'any.required': 'Target user ID is required',
    'string.empty': 'Target user ID cannot be empty',
    'string.pattern.base': 'Target user ID is not in the correct format'
  })
});

module.exports = {
  createDirectRoomValidation
}; 