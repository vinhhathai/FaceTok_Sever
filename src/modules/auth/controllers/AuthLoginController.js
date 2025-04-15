"use strict";
//----------------------------------------------------------------
const { AuthLoginService } = require("../services");
const { errorCode } = require("../../../shared/common/error");
const UserRepository = require("../../user/repositories/UserRepository");

class AuthLoginController {
  constructor() {
    this.authLoginService = new AuthLoginService();
  }

  loginToSystem = async (req, res) => {
    try {
      // Lấy data từ request
      let userData = req.body;

      // Xử lý trường hợp userData có dạng { value: {...} }
      if (userData && userData.value) {
        userData = userData.value;
      }

      let { email, password } = userData;

      // Chuẩn hóa email (chuyển sang chữ thường)
      if (email) {
        email = email.toLowerCase().trim();
      }

      const result = await this.authLoginService.login(email, password);

      return res.status(result.statusCode).json(
        result.success
          ? {
              message: "Login successfully",
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              data: result.data,
            }
          : {
              timestamp: new Date().toISOString(),
              path: "/auth/login",
              error: result.error,
            }
      );
    } catch (error) {
      console.error("Login controller error:", error);
      return res.status(500).json({
        timestamp: new Date().toISOString(),
        path: "/auth/login",
        error: {
          code: errorCode.LOGIN_FAILED,
          message: error.message || "Internal server error",
        },
      });
    }
  };
}

module.exports = AuthLoginController;
