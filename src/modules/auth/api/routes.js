"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const {
  AuthLoginController,
  AuthRegisterController,
  AuthPasswordController
} = require("../controllers");
const { checkLogin } = require("../../../shared/middlewares");
const { loginLimiter, registerLimiter } = require("../../../shared/middlewares/rateLimiter");

// Auth Login Routes
router.post("/login", loginLimiter, AuthLoginController.loginToSystem);
router.post("/refresh-token", loginLimiter, AuthLoginController.refreshToken);
router.post("/logout", checkLogin, AuthLoginController.logout);

// Auth Register Routes
router.post("/sign-up", registerLimiter, AuthRegisterController.signUp);
router.post("/verify-email", AuthRegisterController.verifyEmail);
router.post("/resend-verification", AuthRegisterController.resendVerificationOTP);

// Auth Password Routes
router.post("/request-reset", AuthPasswordController.requestPasswordReset);
router.post("/verify-otp", AuthPasswordController.verifyOTP);
router.post("/reset-password", AuthPasswordController.resetPassword);

module.exports = router;
