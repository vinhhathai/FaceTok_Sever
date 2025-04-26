"use strict";
//----------------------------------------------------------------
const Joi = require('joi');

/**
 * Xác thực dữ liệu khi gửi lời mời kết bạn
 */
const friendRequestValidation = (data) => {
  const schema = Joi.object({
    recipientId: Joi.string().required().messages({
      'any.required': 'ID người nhận là bắt buộc',
      'string.empty': 'ID người nhận không được để trống'
    })
  });

  return schema.validate(data);
};

/**
 * Xác thực ID lời mời kết bạn
 */
const requestIdValidation = (data) => {
  const schema = Joi.object({
    requestId: Joi.string().required().messages({
      'any.required': 'ID lời mời kết bạn là bắt buộc',
      'string.empty': 'ID lời mời kết bạn không được để trống'
    })
  });

  return schema.validate(data);
};

/**
 * Xác thực ID bạn bè
 */
const friendIdValidation = (data) => {
  const schema = Joi.object({
    friendId: Joi.string().required().messages({
      'any.required': 'ID bạn bè là bắt buộc',
      'string.empty': 'ID bạn bè không được để trống'
    })
  });

  return schema.validate(data);
};

/**
 * Xác thực dữ liệu khi kiểm tra trạng thái kết bạn
 */
const friendshipStatusValidation = (data) => {
  const schema = Joi.object({
    targetUserId: Joi.string().required().messages({
      'any.required': 'ID người dùng cần kiểm tra là bắt buộc',
      'string.empty': 'ID người dùng cần kiểm tra không được để trống'
    })
  });

  return schema.validate(data);
};

module.exports = {
  friendRequestValidation,
  requestIdValidation,
  friendIdValidation,
  friendshipStatusValidation
}; 