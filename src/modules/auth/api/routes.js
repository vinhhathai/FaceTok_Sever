"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    AuthLoginController,
    AuthRegisterController,
    AuthPasswordController
} = require('../controllers');
const checkLogin = require('../../../shared/middlewares/checkLogin');
const validateRequest = require('../../../shared/middlewares/validateRequest');
const { 
    loginValidation,
    signUpValidation,
    emailValidation,
    resetPasswordValidation,
    changePasswordValidation
} = require('../../../shared/validation');

// Auth Login Routes
router.post('/login', validateRequest(loginValidation), AuthLoginController.loginToSystem);
// router.post('/refresh-token', AuthLoginController.refreshToken);

// Auth Register Routes
router.post('/sign-up', validateRequest(signUpValidation), AuthRegisterController.signUp);
// router.post('/verify-otp', validateRequest(resetPasswordValidation), AuthRegisterController.verifyOTP);

// Auth Password Routes
router.post('/request-reset', validateRequest(emailValidation), AuthPasswordController.requestPasswordReset);
router.post('/reset-password', validateRequest(resetPasswordValidation), AuthPasswordController.resetPassword);
router.put('/change-password', checkLogin, validateRequest(changePasswordValidation), AuthPasswordController.changePassword);

module.exports = router; 