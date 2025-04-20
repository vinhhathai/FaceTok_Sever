'use strict';
//----------------------------------------------------------------
const Joi = require('joi');

/**
 * Validation cho chức năng tìm kiếm người dùng
 */
const userSearchValidation = (data) => {
  const schema = Joi.object({
    query: Joi.string().required().min(1).max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  });

  return schema.validate(data);
};

module.exports = userSearchValidation; 