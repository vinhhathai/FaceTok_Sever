'use strict';
//----------------------------------------------------------------
var express = require('express');
var router = express.Router();

// import controllers
const SignUpController = require('../../controllers/SignUpController/SignUpController')
const LoginController = require('../../controllers/LoginController/LoginController')
const ResetPasswordController = require('../../controllers/ResetPasswordController/ResetPasswordController')
const RefreshTokenController = require('../../controllers/RefreshTokenController/RefreshTokenController')


// Reset password
router.put('/change-password', ResetPasswordController.changePassword);
// router.get('/reset-password', ResetPasswordController.changePassword);
router.post('/reset-password', ResetPasswordController.resetPassword)


/* POST refresh token */
router.post('/refresh-token', RefreshTokenController.refreshToken);

/* POST LOGIN */
router.post('/login', LoginController.loginToSystem);

/* POST SIGN UP */
router.post('/sign-up', SignUpController.signUp);

module.exports = router;