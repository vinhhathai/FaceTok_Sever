const Joi = require('joi');

const getRoomsValidation = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit cannot be less than 1',
    'number.max': 'Limit cannot be greater than 50'
  })
});

const getRoomDetailsValidation = Joi.object({
  userId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'any.required': 'User ID is required',
    'string.empty': 'User ID cannot be empty',
    'string.pattern.base': 'User ID is not in the correct format'
  }),
 
});

const getRoomByIdValidation = Joi.object({
  roomId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'any.required': 'Room ID is required',
    'string.empty': 'Room ID cannot be empty',
    'string.pattern.base': 'Room ID is not in the correct format'
  })
});

module.exports = {
  getRoomsValidation,
  getRoomDetailsValidation,
  getRoomByIdValidation
}; 