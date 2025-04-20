const Joi = require('joi');

const sendMessageValidation = Joi.object({
  receiverId: Joi.string().required().messages({
    'any.required': 'ID người nhận là bắt buộc',
    'string.empty': 'ID người nhận không được để trống'
  }),
  content: Joi.string().required().max(1000).messages({
    'string.max': 'Nội dung tin nhắn không được vượt quá 1000 ký tự',
    'any.required': 'Nội dung tin nhắn là bắt buộc',
    'string.empty': 'Nội dung tin nhắn không được để trống'
  }),
  type: Joi.string().valid('text', 'image', 'file').default('text').messages({
    'any.only': 'Loại tin nhắn phải là một trong các giá trị: text, image, file'
  })
});

module.exports = {
  sendMessageValidation
};