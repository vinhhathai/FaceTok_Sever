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

const changeGroupOwnerValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Room ID is required",
    "string.empty": "Room ID cannot be empty",
  }),
  newOwnerId: Joi.string().required().messages({
    "any.required": "New owner ID is required",
    "string.empty": "New owner ID cannot be empty",
  }),
});

const leaveGroupValidation = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "Room ID is required",
    "string.empty": "Room ID cannot be empty",
  }),
});

const kickOutMemberValidation = Joi.object({
  roomId: Joi.string().required().messages({
    "any.required": "Room ID is required",
    "string.empty": "Room ID cannot be empty",
  }),
  kickOutUserId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
});

module.exports = {
  createGroupValidation,
  getGroupByIdValidation,
  renameGroupValidation,
  changeGroupOwnerValidation,
  leaveGroupValidation,
  kickOutMemberValidation,
};
