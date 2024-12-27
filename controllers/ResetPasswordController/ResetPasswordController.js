"use strict";
//----------------------------------------------------------------
const UserModel = require("../../models/UserModel");
const emailValidation = require("../../validation/emailValidation");
const jwt = require("jsonwebtoken");
const { errorMessage, errorCode } = require("../../common/enum/error");
require("dotenv").config();
const sendResetPasswordEmail = require("../../utils/sendResetPasswordEmail");
const { generateOTP } = require("../../utils/generateOTPCode");

// Send a reset password email
exports.resetPassword = async (req, res, next) => {
  // Validation
  try {
    const { error } = await emailValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: "/auth/reset-password",
        code: errorCode.VALIDATION_FAILED,
        error: {
          name: error.message,
        },
      });
    }

    // Get email for sending
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email });
    // Create token
    if (user) {
      // const resetPasswordToken = jwt.sign({ email }, process.env.SECRET_KEY, {
      //   expiresIn: "3m",
      // }); // 3 minutes
      // // Setup link for reset password
      // const host = "localhost:3000";
      // const protocol = req.protocol;
      // const resetLink = `${protocol}://${host}/auth/reset-password?token=${resetPasswordToken}`;
      const otp = generateOTP(email).otp;
      const otpExpire = generateOTP(email).expires;
      console.log(otp, otpExpire);

      await UserModel.updateOne(
        { email },
        { $set: { otp: otp, otpExpire: otpExpire } }
      );

      // Send email
      try {
        sendResetPasswordEmail("Facetok", email, otp);
        return res.status(201).json({
          message: `Reset password link has been sent to ${email}`,
        });
      } catch (error) {
        return res.status(401).json({
          timestamp: new Date().toISOString(),
          path: "/auth/reset-password",
          code: errorCode.EMAIL_SERVICE_UNAUTHORIZED,
          error: {
            name: errorMessage.EMAIL_SERVICE_UNAUTHORIZED,
          },
        });
      }
    }

    return res.status(404).json({
      timestamp: new Date().toISOString(),
      path: "/auth/reset-password",
      code: errorCode.EMAIL_NOT_FOUND,
      error: {
        name: errorMessage.EMAIL_NOT_FOUND,
      },
    });
  } catch (error) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      path: "/auth/reset-password",
      code: errorCode.ERR_GET_RESET_PASSWORD_LINK_FAILED,
      error: {
        name: error.message,
      },
    });
  }
};
