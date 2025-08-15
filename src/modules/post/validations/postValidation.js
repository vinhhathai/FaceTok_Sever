const Joi = require("joi");

// Media item schema
const mediaItemSchema = Joi.object({
  type: Joi.string().valid("image", "video").required(),
  url: Joi.string().uri().required(),
});

// Create post validation: at least one of content or media must be provided
const createPostValidation = Joi.object({
  content: Joi.string().allow("").max(5000),
  media: Joi.array().items(mediaItemSchema).default([]),
  privacy: Joi.string().valid("public", "friends", "private").default("public"),
}).custom((value, helpers) => {
  const hasContent = !!(value.content && value.content.trim());
  const hasMedia = Array.isArray(value.media) && value.media.length > 0;
  if (!hasContent && !hasMedia) {
    return helpers.error("any.invalid", {
      message: "Post must include content or at least one media item",
    });
  }
  if (Array.isArray(value.media) && value.media.length > 5) {
    return helpers.error("any.invalid", {
      message: "Post can include at most 5 media items",
    });
  }
  return value;
}, "Create post custom rule");

module.exports = {
  createPostValidation,
};
