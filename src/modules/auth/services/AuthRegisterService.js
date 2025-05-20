"use strict";
//----------------------------------------------------------------
const bcrypt = require("bcrypt");
const UserRepository = require("../../user/repositories/UserRepository");
const { errorCode } = require("../../../shared/common/error");
const { AuthRegisterDto } = require("../dtos");

class AuthRegisterService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data) {
    try {
      // Check if email already exists
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        return AuthRegisterDto.error(
          errorCode.EMAIL_ALREADY_EXISTS,
          "Email is already in use. Please use a different email."
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // Create userData object from input data
      const userData = {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        isActive: true,
      };

      // Create new user with correct schema structure
      const newUser = await this.userRepository.create(userData);

      // Create response data from DTO
      const responseData = AuthRegisterDto.toResponse(newUser);

      return AuthRegisterDto.success(
        responseData,
        "Account registration successful"
      );
    } catch (error) {
      return AuthRegisterDto.error(
        errorCode.REGISTER_FAILED,
        "Account registration failed",
        error.message
      );
    }
  }
}

module.exports = AuthRegisterService;
