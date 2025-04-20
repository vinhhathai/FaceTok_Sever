'use strict';
//----------------------------------------------------------------

// Import all validations
const { updateProfileValidation, profileValidation } = require('./userValidation');
const avatarValidation = require('./avatarValidation');
const thumbnailValidation = require('./thumbnailValidation');
const fullnameValidation = require('./fullnameValidation');
const userSearchValidation = require('./userSearchValidation');

// Export all validations
module.exports = {
    updateProfileValidation,
    profileValidation,
    avatarValidation,
    thumbnailValidation,
    fullnameValidation,
    userSearchValidation
}; 