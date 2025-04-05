"use strict";
//----------------------------------------------------------------
const loginValidation = require("../../validation/loginValidation");
const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { errorCode, errorMessage } = require("../../common/enum/error");
require("dotenv").config();

exports.loginToSystem = async (req, res) => {
  // Validation
  try {
    const { error } = await loginValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        path: "/auth/login",
        code: errorCode.VALIDATION_FAILED,
        error: {
          name: error.message,
        },
      });
    }

    // Check email in database
    const { email } = req.body;
    const emailExist = await UserModel.findOne({ email });

    if (!emailExist) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        path: "/auth/login",
        code: errorCode.DATA_NOT_FOUND,
        error: {
          name: errorMessage.DATA_NOT_FOUND,
        },
      });
    }

    // Decode and Check pasword
    const checkPassword = await bcrypt.compare(
      req.body.password,
      emailExist.password
    );
    if (!checkPassword) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        path: "/auth/login",
        code: errorCode.DATA_NOT_FOUND,
        error: {
          name: errorMessage.DATA_NOT_FOUND,
        },
      });
    }

    // Check isActive account
    const isActive = emailExist.isActive;
    console.log(isActive);
    if (!isActive) {
      return res.status(403).json({
        timestamp: new Date().toISOString(),
        path: "/auth/login",
        code: errorCode.ACCOUNT_IS_BANNED,
        error: {
          name: errorMessage.ACCOUNT_IS_BANNED,
        },
      });
    }

    // Create jwt token
    const accessToken = jwt.sign(
      { _id: emailExist._id,
        profilePicture: emailExist.profilePicture,
        fullName: emailExist.fullName,
        thumbnail: emailExist.thumbnail,
        bio: emailExist.bio,
       },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    ); // 5 minutes
    const refreshToken = jwt.sign(
      { _id: emailExist._id },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    ); // 7 days

    // If everything is okay, return success message
    emailExist.password = undefined;
    return res.status(200).json({
      message: "Login successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    returnres.status(500).json({
      timestamp: new Date().toISOString(),
      path: "/auth/login",
      code: errorCode.ERR_LOGIN_FAILED,
      error: {
        name: error.message,
      },
    });
  }
};
