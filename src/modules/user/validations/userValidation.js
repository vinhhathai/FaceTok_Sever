'use strict';
//----------------------------------------------------------------
const Joi = require('joi');
const JoiDate = require('@joi/date');
const JoiExtended = Joi.extend(JoiDate);

/**
 * Validation cho cập nhật profile
 */
const updateProfileValidation = (data) => {
  const schema = Joi.object({
    bio: Joi.string().allow(''),
    fullName: Joi.string().min(3).max(50),
    gender: Joi.string().valid('male', 'female', 'undefined'),
    location: Joi.string().allow(''),
    birthday: Joi.date()
  });

  return schema.validate(data);
};

/**
 * Validation cho xem profile
 */
const profileValidation = (data) => {
  const schema = Joi.object({
    id: Joi.string().required()
  });

  return schema.validate(data);
};

module.exports = {
  updateProfileValidation,
  profileValidation
}; 