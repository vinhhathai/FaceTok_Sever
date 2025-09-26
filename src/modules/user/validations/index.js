'use strict';
//----------------------------------------------------------------

// Import all validations
const { updateProfileValidation, profileValidation, blockUserValidation } = require('./userValidation');
const avatarValidation = require('./avatarValidation');
const thumbnailValidation = require('./thumbnailValidation');
const fullnameValidation = require('./fullnameValidation');
const userSearchValidation = require('./userSearchValidation');

// Export all validations
module.exports = {
    updateProfileValidation,
    profileValidation,
    blockUserValidation,
    avatarValidation,
    thumbnailValidation,
    fullnameValidation,
    userSearchValidation
}; 