const Joi = require('joi');
const JoiDate = require('@joi/date');
const JoiExtended = Joi.extend(JoiDate);

const updateProfileValidation = Joi.object({
  firstName: Joi.string().min(1).max(50).messages({
    'string.min': 'Tên phải có ít nhất 1 ký tự',
    'string.max': 'Tên không được vượt quá 50 ký tự',
    'string.empty': 'Tên không được để trống'
  }),
  lastName: Joi.string().min(1).max(50).messages({
    'string.min': 'Họ phải có ít nhất 1 ký tự',
    'string.max': 'Họ không được vượt quá 50 ký tự',
    'string.empty': 'Họ không được để trống'
  }),
  bio: Joi.string().allow('').max(200).messages({
    'string.max': 'Tiểu sử không được vượt quá 200 ký tự'
  }),
  location: Joi.string().allow('').max(100).messages({
    'string.max': 'Vị trí không được vượt quá 100 ký tự'
  }),
  birthday: JoiExtended.date().format('YYYY-MM-DD').messages({
    'date.format': 'Ngày sinh phải có định dạng YYYY-MM-DD'
  }),
  gender: Joi.string().valid('male', 'female', 'other').messages({
    'any.only': 'Giới tính phải là một trong các giá trị: male, female, other'
  }),
  phoneNumber: Joi.string().pattern(/^\d{10,11}$/).allow('').messages({
    'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số'
  })
});

module.exports = {
  updateProfileValidation
}; 