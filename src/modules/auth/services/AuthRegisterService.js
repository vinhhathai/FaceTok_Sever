"use strict";
//----------------------------------------------------------------
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");
const { createErrorResponse } = require("../../../shared/helper/createErrorResponse");

class AuthRegisterService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData) {
    try {
      // Chuẩn hóa email (chuyển sang chữ thường)
      if (userData.email) {
        userData.email = userData.email.toLowerCase().trim();
      }

      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingEmail) {
        return {
          success: false,
          statusCode: 409,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email already exists",
          },
        };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Tạo người dùng mới với cấu trúc đúng theo schema
      const newUser = await this.userRepository.create({
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        bio: "",
        profilePicture: "https://via.placeholder.com/150",
        thumbnail: "https://via.placeholder.com/50",
      });

      return {
        success: true,
        statusCode: 201,
        data: {
          message: "User registered successfully. Please verify your email.",
          userId: newUser._id,
        },
      };
    } catch (error) {
      console.error("Error in register:", error);
      return createErrorResponse(
        500,
        "INTERNAL_SERVER_ERROR",
        "An error occurred during registration",
        error.message
      );
    }
  }

  
}

module.exports = AuthRegisterService;
