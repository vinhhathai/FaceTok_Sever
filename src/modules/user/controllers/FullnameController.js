"use strict";
//----------------------------------------------------------------
const { errorCode, errorMessage } = require("../../../shared/common/error");
const { FullnameService } = require("../services");
const { FullnameDto } = require("../dtos");
const { fullnameValidation } = require("../validations");

/**
 * Controller for handling user fullname operations
 */
class FullnameController {
  constructor() {
    this.fullnameService = new FullnameService();
  }


  updateFullName = async (req, res) => {
    try {
      
      // Validate input data using Joi
      const { error, value } = fullnameValidation.fullnameUpdateValidation.validate(req.body);
      
      if (error) {
        return res.status(400).json(
          FullnameDto.error(
            errorCode.VALIDATION_FAILED,
            error.details[0].message
          )
        );
      }
      
      // Get user ID from token
      const userId = req.user.id;
      
      console.log("User ID:", userId);
      console.log("New fullname:", value.fullName);

      // Check user ID
      if (!userId) {
        return res.status(400).json(
          FullnameDto.error(
            errorCode.VALIDATION_FAILED,
            "Cannot get user ID"
          )
        );
      }

      // Format data using DTO
      const fullnameData = FullnameDto.toUpdateData(value);

      // Call service to update fullname
      const result = await this.fullnameService.updateFullName(userId, fullnameData.fullName);

      // Check result and return appropriate response
      if (!result.success) {
        let statusCode = 500;
        
        if (result.error && result.error.code === errorCode.DATA_NOT_FOUND) {
          statusCode = 404;
        } else if (result.error && result.error.code === errorCode.VALIDATION_FAILED) {
          statusCode = 400;
        } else if (result.error && result.error.code === errorCode.NAME_UPDATE_TIME_LIMIT) {
          statusCode = 400;
        }
        
        return res.status(statusCode).json({
          ...result,
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      // Return success result
      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Error in updateFullName controller:", error);
      return res.status(500).json(
        FullnameDto.error(
          errorCode.ERR_UPDATE_PROFILE_FAILED,
          error.message || "Error updating fullname"
        )
      );
    }
  };
}

module.exports = FullnameController; 