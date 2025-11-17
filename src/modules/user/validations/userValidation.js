'use strict';
//----------------------------------------------------------------
const Joi = require('joi');
const JoiDate = require('@joi/date');
const JoiExtended = Joi.extend(JoiDate);

/**
 * Profile update validation schema
 */
const updateProfileValidation = (data) => {
  const schema = Joi.object({
    bio: Joi.string().max(500).allow(''),
    gender: Joi.string().valid('male', 'female', 'other'),
    location: Joi.string().max(100).allow(''),
    relationship: Joi.string().valid('single', 'relationship', 'married', ''),
    birthday: Joi.date().iso().max('now').allow(null, '')
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Profile view validation schema
 */
const profileValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('Invalid user ID format'),
  });

  return schema.validate(data);
};

const blockUserValidation = (data) => {
  const schema = Joi.object({
    blockedUserId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('Invalid user ID format'),
  });

  return schema.validate(data);
};

module.exports = {
  updateProfileValidation,
  profileValidation,
  blockUserValidation
};