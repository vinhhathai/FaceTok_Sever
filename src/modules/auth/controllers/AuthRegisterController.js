"use strict";
//----------------------------------------------------------------
const { AuthRegisterService } = require("../services");
const { errorCode } = require("../../../shared/common/error");

class AuthRegisterController {
  constructor() {
    this.authRegisterService = new AuthRegisterService();
  }

  signUp = async (req, res) => {
    try {
      // Lấy data từ request
      let userData = req.body;
      console.log("userData", userData);

      // Xử lý trường hợp userData có dạng { value: {...} }
      if (userData && userData.value) {
        userData = userData.value;
      }

      const result = await this.authRegisterService.register(userData);

      return res.status(result.statusCode).json(
        result.success
          ? { message: "Account created successfully", status: true }
          : {
              timestamp: new Date().toISOString(),
              path: "/auth/sign-up",
              error: result.error,
            }
      );
    } catch (error) {
      console.error("Sign up controller error:", error);
      return res.status(500).json({
        timestamp: new Date().toISOString(),
        path: "/auth/sign-up",
        error: {
          code: errorCode.CREATE_ACCOUNT_FAILED,
          message: error.message || "Internal server error",
        },
      });
    }
  };
}

module.exports = AuthRegisterController;
