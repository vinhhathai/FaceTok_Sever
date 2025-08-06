const Joi = require("joi");

const createGroupValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 30 characters long",
  }),

  members: Joi.array().required().messages({
    "any.required": "Members are required",
    "array.empty": "Members cannot be empty",
  }),
});

const getGroupByIdValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Group ID is required",
    "string.empty": "Group ID cannot be empty",
  }),
});

const renameGroupValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Group ID is required",
    "string.empty": "Group ID cannot be empty",
  }),
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 30 characters long",
  }),
});

module.exports = {
  createGroupValidation,
  getGroupByIdValidation,
  renameGroupValidation,
};
