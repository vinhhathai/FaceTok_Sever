"use strict";
//----------------------------------------------------------------
const { AuthLoginService } = require("../services");
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { AuthLoginDto } = require("../dtos");
const { loginValidation } = require("../validations/authValidation");

class AuthLoginController {
  constructor() {
    this.authLoginService = new AuthLoginService();
  }

  loginToSystem = async (req, res) => {
    try {
      // Validate dữ liệu đầu vào bằng Joi
      const { error, value } = loginValidation.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          path: req.originalUrl,
          error: {
            code: errorCode.INVALID_INPUT,
            message: error.details[0].message
          },
          timestamp: new Date().toISOString()
        });
      }
      
      
      const result = await this.authLoginService.login(value.email, value.password);

      if (result.success) {
        return res.status(200).json({
          ...result
        });
      } else {
        return res.status(400).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      return res.status(500).json({
        ...AuthLoginDto.error(
          errorCode.LOGIN_FAILED,
          errorMessage.LOGIN_FAILED,
          error.message
        ),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = AuthLoginController;
