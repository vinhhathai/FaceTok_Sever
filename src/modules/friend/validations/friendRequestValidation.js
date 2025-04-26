"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

/**
 * Xác thực dữ liệu khi gửi lời mời kết bạn
 * @param {Object} data - Dữ liệu cần xác thực
 * @returns {Object} - Kết quả xác thực
 */
const friendRequestValidation = (data) => {
  const schema = Joi.object({
    recipientId: Joi.string()
      .required()
      .messages({
        'string.empty': 'ID người nhận không được để trống',
        'any.required': 'ID người nhận là bắt buộc'
      })
  });

  return schema.validate(data);
};

module.exports = friendRequestValidation; 