"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const {
  AuthLoginController,
  AuthRegisterController,
  AuthPasswordController,
} = require("../controllers");

// Auth Login Routes
router.post("/login", AuthLoginController.loginToSystem);
// router.post('/refresh-token', AuthLoginController.refreshToken);

// Auth Register Routes
router.post("/sign-up", AuthRegisterController.signUp);
router.post("/verify-email", AuthRegisterController.verifyEmail);
router.post("/resend-verification", AuthRegisterController.resendVerificationOTP);

// Auth Password Routes
router.post("/request-reset", AuthPasswordController.requestPasswordReset);
router.post("/verify-otp", AuthPasswordController.verifyOTP);
router.post("/reset-password", AuthPasswordController.resetPassword);

module.exports = router;
