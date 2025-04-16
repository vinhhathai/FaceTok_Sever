"use strict";
//----------------------------------------------------------------
const { AuthRegisterService } = require("../services");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AuthRegisterDto } = require("../dtos");
const { signUpValidation } = require("../validations/authValidation");

class AuthRegisterController {
  constructor() {
    this.authRegisterService = new AuthRegisterService();
  }

  signUp = async (req, res) => {
    try {
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = signUpValidation.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: error.details[0].message,
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Tạo DTO từ dữ liệu đã validate
      const registerDto = new AuthRegisterDto(value);

      // Chuẩn hóa dữ liệu và gọi service
      registerDto.normalize();
      const result = await this.authRegisterService.register(registerDto);

      if (result.success) {
        return res.status(201).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Sign up controller error:", error);
      return res.status(500).json({
        ...AuthRegisterDto.error(
          errorCode.CREATE_ACCOUNT_FAILED,
          errorMessage.CREATE_ACCOUNT_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = AuthRegisterController;
