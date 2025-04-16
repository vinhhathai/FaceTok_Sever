const Joi = require('joi');

const createPostValidation = Joi.object({
  content: Joi.string().max(1000).allow('').messages({
    'string.max': 'Nội dung bài viết không được vượt quá 1000 ký tự'
  }),
  privacy: Joi.string().valid('public', 'friends', 'private').default('public').messages({
    'any.only': 'Quyền riêng tư phải là một trong các giá trị: public, friends, private'
  })
});

const updatePostValidation = Joi.object({
  content: Joi.string().max(1000).allow('').messages({
    'string.max': 'Nội dung bài viết không được vượt quá 1000 ký tự'
  }),
  privacy: Joi.string().valid('public', 'friends', 'private').messages({
    'any.only': 'Quyền riêng tư phải là một trong các giá trị: public, friends, private'
  })
});

const createCommentValidation = Joi.object({
  content: Joi.string().required().max(500).messages({
    'string.max': 'Nội dung bình luận không được vượt quá 500 ký tự',
    'any.required': 'Nội dung bình luận là bắt buộc',
    'string.empty': 'Nội dung bình luận không được để trống'
  }),
  postId: Joi.string().required().messages({
    'any.required': 'ID bài viết là bắt buộc',
    'string.empty': 'ID bài viết không được để trống'
  })
});

module.exports = {
  createPostValidation,
  updatePostValidation,
  createCommentValidation
}; 