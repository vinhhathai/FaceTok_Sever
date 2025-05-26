"use strict";

/**
 * Main error module that combines error codes and messages
 */
const {
  // Error codes by category
  AUTH_ERRORS,
  VALIDATION_ERRORS,
  DATA_ERRORS,
  USER_ERRORS,
  POST_ERRORS,
  FRIEND_ERRORS,
  MESSAGE_ERRORS,
  NOTIFICATION_ERRORS,
  SERVER_ERRORS,
  REQUEST_ERRORS,

  // Combined collection for backward compatibility
  errorCode,
} = require("./errorCodes");

const {
  // Error messages by category
  AUTH_MESSAGES,
  VALIDATION_MESSAGES,
  DATA_MESSAGES,
  USER_MESSAGES,
  POST_MESSAGES,
  FRIEND_MESSAGES,
  MESSAGE_MESSAGES,
  SERVER_MESSAGES,
  REQUEST_MESSAGES,

  // Combined collection for backward compatibility
  errorMessage,
} = require("./errorMessages");

module.exports = {
  // Error codes by category
  AUTH_ERRORS,
  VALIDATION_ERRORS,
  DATA_ERRORS,
  USER_ERRORS,
  POST_ERRORS,
  FRIEND_ERRORS,
  MESSAGE_ERRORS,
  NOTIFICATION_ERRORS,
  SERVER_ERRORS,
  REQUEST_ERRORS,

  // Error messages by category
  AUTH_MESSAGES,
  VALIDATION_MESSAGES,
  DATA_MESSAGES,
  USER_MESSAGES,
  POST_MESSAGES,
  FRIEND_MESSAGES,
  MESSAGE_MESSAGES,
  SERVER_MESSAGES,
  REQUEST_MESSAGES,

  // Combined collections for backward compatibility
  errorCode,
  errorMessage,
};
