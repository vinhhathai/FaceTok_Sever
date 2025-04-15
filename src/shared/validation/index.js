'use strict';
//----------------------------------------------------------------

// Import all validations
const loginValidation = require('./loginValidation');
const signUpValidation = require('./signUpValidation');
const changePasswordValidation = require('./changePasswordValidation');
const emailValidation = require('./emailValidation');
const resetPasswordValidation = require('./resetPasswordValidation');

// Export all validations
module.exports = {
    loginValidation,
    signUpValidation,
    changePasswordValidation,
    emailValidation,
    resetPasswordValidation
}; 