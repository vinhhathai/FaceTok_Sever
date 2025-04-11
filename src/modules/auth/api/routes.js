"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    AuthLoginController,
    AuthRegisterController,
    AuthPasswordController
} = require('../controllers');
const { checkLogin } = require('../../../middlewares/auth');

// Auth Login Routes
router.post('/login', AuthLoginController.loginToSystem);
router.post('/refresh-token', AuthLoginController.refreshToken);
router.post('/logout', checkLogin, AuthLoginController.logout);

// Auth Register Routes
router.post('/sign-up', AuthRegisterController.signUp);
router.post('/verify-otp', AuthRegisterController.verifyOTP);

// Auth Password Routes
router.post('/request-reset', AuthPasswordController.requestPasswordReset);
router.post('/reset-password', AuthPasswordController.resetPassword);
router.put('/change-password', checkLogin, AuthPasswordController.changePassword);

module.exports = router; 