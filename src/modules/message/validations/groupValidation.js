const Joi = require("joi");

const createGroupValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 30 characters long",
  }),

  members: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[a-f\d]{24}$/i)
        .messages({
          "string.pattern.base": "Member ID must be a 24-hex ObjectId",
          "string.empty": "Member ID cannot be empty",
        })
    )
    .required()
    .messages({
      "any.required": "Members are required",
      "array.empty": "Members cannot be empty",
    }),
});

const getGroupByIdValidation = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Group ID is required",
      "string.empty": "Group ID cannot be empty",
      "string.pattern.base": "Group ID must be a 24-hex ObjectId",
    }),
});

const renameGroupValidation = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Group ID is required",
      "string.empty": "Group ID cannot be empty",
      "string.pattern.base": "Group ID must be a 24-hex ObjectId",
    }),
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be less than 30 characters long",
  }),
});

const updateGroupAvatarValidation = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Room ID is required",
      "string.empty": "Room ID cannot be empty",
      "string.pattern.base": "Room ID must be a 24-hex ObjectId",
    }),
});

const changeGroupOwnerValidation = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Room ID is required",
      "string.empty": "Room ID cannot be empty",
      "string.pattern.base": "Room ID must be a 24-hex ObjectId",
    }),
  newOwnerId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "New owner ID is required",
      "string.empty": "New owner ID cannot be empty",
      "string.pattern.base": "New owner ID must be a 24-hex ObjectId",
    }),
});

const leaveGroupValidation = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Room ID is required",
      "string.empty": "Room ID cannot be empty",
      "string.pattern.base": "Room ID must be a 24-hex ObjectId",
    }),
});

const kickOutMemberValidation = Joi.object({
  roomId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Room ID is required",
      "string.empty": "Room ID cannot be empty",
      "string.pattern.base": "Room ID must be a 24-hex ObjectId",
    }),
  kickOutUserId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "User ID is required",
      "string.empty": "User ID cannot be empty",
      "string.pattern.base": "User ID must be a 24-hex ObjectId",
    }),
});

const inviteToGroupValidation = Joi.object({
  roomId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "Room ID is required",
      "string.empty": "Room ID cannot be empty",
      "string.pattern.base": "Room ID must be a 24-hex ObjectId",
    }),
  userId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      "any.required": "User ID is required",
      "string.empty": "User ID cannot be empty",
      "string.pattern.base": "User ID must be a 24-hex ObjectId",
    }),
});

module.exports = {
  createGroupValidation,
  getGroupByIdValidation,
  renameGroupValidation,
  changeGroupOwnerValidation,
  leaveGroupValidation,
  kickOutMemberValidation,
  inviteToGroupValidation,
  updateGroupAvatarValidation,
};
