"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

/**
 * Validate data when sending friend request
 */
const friendRequestValidation = (data) => {
  const schema = Joi.object({
    recipientId: Joi.string().required().messages({
      'any.required': 'Recipient ID is required',
      'string.empty': 'Recipient ID cannot be empty'
    })
  });

  return schema.validate(data);
};

/**
 * Validate friend request ID
 */
const requestIdValidation = (data) => {
  const schema = Joi.object({
    requestId: Joi.string().required().messages({
      'any.required': 'Request ID is required',
      'string.empty': 'Request ID cannot be empty'
    })
  });

  return schema.validate(data);
};

/**
 * Validate friend ID
 */
const friendIdValidation = (data) => {
  const schema = Joi.object({
    friendId: Joi.string().required().messages({
      'any.required': 'Friend ID is required',
      'string.empty': 'Friend ID cannot be empty'
    })
  });

  return schema.validate(data);
};

/**
 * Validate data when checking friendship status
 */
const friendshipStatusValidation = (data) => {
  const schema = Joi.object({
    targetUserId: Joi.string().required().messages({
      'any.required': 'Target user ID is required',
      'string.empty': 'Target user ID cannot be empty'
    })
  });

  return schema.validate(data);
};

/**
 * Validate search query parameters
 */
const searchQueryValidation = (data) => {
  const schema = Joi.object({
    query: Joi.string().required().min(1).max(100).messages({
      'any.required': 'Search query is required',
      'string.empty': 'Search query cannot be empty',
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 100 characters'
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be greater than or equal to 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be greater than or equal to 1',
      'number.max': 'Limit cannot exceed 100'
    })
  });

  return schema.validate(data);
};

module.exports = {
  friendRequestValidation,
  requestIdValidation,
  friendIdValidation,
  friendshipStatusValidation,
  searchQueryValidation
}; 