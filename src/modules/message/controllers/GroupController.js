"use strict";
//----------------------------------------------------------------
const MessageService = require("../services/MessageService");
const GroupService = require("../services/GroupService");
const { MessageDto } = require("../dtos");
const {
  sendMessageValidation,
  revokeMessageValidation,
  createGroupValidation,
  getGroupByIdValidation,
} = require("../validations");
const {
  VALIDATION_ERRORS,
  MESSAGE_ERRORS,
} = require("../../../shared/common/error");
const GroupDto = require("../dtos/GroupDto");
const {
  renameGroupValidation,
  changeGroupOwnerValidation,
} = require("../validations/groupValidation");

class GroupController {
  constructor() {
    this.groupService = GroupService;
  }

  changeGroupOwner = async (req, res) => {
    try {
      const { error, value } = changeGroupOwnerValidation.validate(req.body);
      if (error) {
        return res.status(400).json(GroupDto.error(error.details[0].message));
      }
      const { id, newOwnerId } = value;
      const currentUserId = req.user.id;
      const group = await this.groupService.changeGroupOwner(
        id,
        currentUserId,
        newOwnerId
      );
      return res.status(200).json(GroupDto.success(group));
    } catch (error) {
      return res.status(500).json(GroupDto.error(error));
    }
  };

  createGroup = async (req, res) => {
    try {
      const ownerId = req.user.id;
      const { error, value } = createGroupValidation.validate(req.body);
      if (error) {
        console.error("Validation error:", error.details[0].message);
        return res.status(400).json(GroupDto.error(error.details[0].message));
      }
      const { name, members } = value;
      const group = await this.groupService.createGroup(name, ownerId, members);
      return res.status(200).json(GroupDto.success(group));
    } catch (error) {
      console.error("Error in createGroup controller:", error);
      return res
        .status(500)
        .json(GroupDto.error(error.message || "Internal server error"));
    }
  };

  getGroupById = async (req, res) => {
    try {
      const { error, value } = getGroupByIdValidation.validate(req.params);
      if (error) {
        return res.status(400).json(GroupDto.error(error.details[0].message));
      }
      const { id } = value;
      const group = await this.groupService.getGroupById(id);
      return res.status(200).json(GroupDto.success(group));
    } catch (error) {
      return res.status(500).json(GroupDto.error(error));
    }
  };
}

module.exports = new GroupController();
