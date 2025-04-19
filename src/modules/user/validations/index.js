'use strict';
//----------------------------------------------------------------

// Import all validations
const { updateProfileValidation, profileValidation } = require('./userValidation');

// Export all validations
module.exports = {
    updateProfileValidation,
    profileValidation
}; 