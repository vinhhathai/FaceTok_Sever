"use strict";
//----------------------------------------------------------------
const Joi = require("joi");

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(255),
});

module.exports = loginValidation;
