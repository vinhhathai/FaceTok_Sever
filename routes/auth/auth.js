"use strict";
//----------------------------------------------------------------
var express = require("express");
var router = express.Router();

// import controllers
const SignUpController = require("../../controllers/SignUpController/SignUpController");
const LoginController = require("../../controllers/LoginController/LoginController");
const ResetPasswordController = require("../../controllers/ResetPasswordController/ResetPasswordController");
const RefreshTokenController = require("../../controllers/RefreshTokenController/RefreshTokenController");
const ChangePasswordController = require("../../controllers/ChangePasswordController/ChangePasswordController");
const VerifyOTPController = require("../../controllers/VerifyOTPController/VerifyOTPController");


// Change password
router.put("/change-password", ChangePasswordController.changePassword);

// Verify OTP
router.post("/verify-otp", VerifyOTPController.verifyOTP);

// Reset password
router.post("/reset-password", ResetPasswordController.resetPassword);

/* POST refresh token */
router.post("/refresh-token", RefreshTokenController.refreshToken);

/* POST LOGIN */
router.post("/login", LoginController.loginToSystem);

/* POST SIGN UP */
router.post("/sign-up", SignUpController.signUp);

module.exports = router;
