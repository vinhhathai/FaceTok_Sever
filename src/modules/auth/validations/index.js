'use strict';
//----------------------------------------------------------------

// Import all validations
const {
    emailValidation,
    resetPasswordValidation,
    loginValidation,
    signUpValidation,
    changePasswordValidation
} = require('./authValidation');

// Export all validations
module.exports = {
    emailValidation,
    resetPasswordValidation,
    loginValidation,
    signUpValidation,
    changePasswordValidation
}; 