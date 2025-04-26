'use strict';
//----------------------------------------------------------------

// Import all validations
const { friendRequestValidation, requestIdValidation, friendIdValidation, friendshipStatusValidation } = require('./friendValidation');
const friendValidation = require('./friendValidation');

// Export all validations
module.exports = {
    friendRequestValidation,
    friendValidation,
    friendshipStatusValidation
}; 