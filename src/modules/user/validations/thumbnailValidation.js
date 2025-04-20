"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

// Validation schema cho cập nhật thumbnail
const thumbnailUpdateValidation = Joi.object({
  thumbnailUrl: Joi.string().required().messages({
    'string.empty': 'URL thumbnail không được để trống',
    'any.required': 'URL thumbnail là bắt buộc'
  })
});

module.exports = {
  thumbnailUpdateValidation
}; 