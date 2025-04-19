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
      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        return AuthRegisterDto.error(
          errorCode.EMAIL_ALREADY_EXISTS,
          "Email đã được sử dụng. Vui lòng sử dụng email khác."
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // Tạo đối tượng userData từ dữ liệu đầu vào
      const userData = {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        isActive: true,
      };

      // Tạo người dùng mới với cấu trúc đúng theo schema
      const newUser = await this.userRepository.create(userData);

      // Tạo response data từ DTO
      const responseData = AuthRegisterDto.toResponse(newUser);

      return AuthRegisterDto.success(
        responseData,
        "Đăng ký tài khoản thành công"
      );
    } catch (error) {
      return AuthRegisterDto.error(
        errorCode.REGISTER_FAILED,
        "Đăng ký tài khoản thất bại",
        error.message
      );
    }
  }
}

module.exports = AuthRegisterService;
