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

  async register(registerDto) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await this.userRepository.findByEmail(registerDto.email);
      if (existingEmail) {
        return AuthRegisterDto.error(
          errorCode.EMAIL_ALREADY_EXISTS,
          "Email đã được sử dụng. Vui lòng sử dụng email khác."
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(registerDto.password, salt);

      // Lấy dữ liệu người dùng từ DTO
      const userData = registerDto.toCreateUserData();
      
      // Tạo người dùng mới với cấu trúc đúng theo schema
      const newUser = await this.userRepository.create({
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        dateOfBirth: userData.dateOfBirth || null,
        gender: userData.gender || "undefined",
        bio: "",
        profilePicture: process.env.DEFAULT_PROFILE_PICTURE || "https://via.placeholder.com/150",
        thumbnail: process.env.DEFAULT_THUMBNAIL || "https://via.placeholder.com/50",
        isActive: true
      });

      // Tạo response data từ DTO
      const responseData = AuthRegisterDto.toResponse(newUser);

      return AuthRegisterDto.success(
        responseData,
        "Đăng ký tài khoản thành công"
      );
    } catch (error) {
      console.error("Error in register:", error);
      return AuthRegisterDto.error(
        errorCode.REGISTER_FAILED,
        "Đăng ký tài khoản thất bại",
        error.message
      );
    }
  }
}

module.exports = AuthRegisterService;
