"use strict";
//----------------------------------------------------------------
const GroupService = require("../services/GroupService");
const {
  createGroupValidation,
  getGroupByIdValidation,
} = require("../validations");
const GroupDto = require("../dtos/GroupDto");
const {
  changeGroupOwnerValidation,
  updateGroupAvatarValidation,
} = require("../validations/groupValidation");
const {
  processAndUploadImage,
} = require("../../../shared/utils/cloudinaryUpload");
const uploadImageMiddleware = require("../../../shared/middlewares/uploadImageMiddleware");
const SocketBus = require("../../../shared/socket/SocketBus");

class GroupController {
  constructor() {
    this.groupService = GroupService;
  }

  updateAvatar = [
    uploadImageMiddleware.single("avatar"),
    async (req, res) => {
      try {
        const currentUserId = req.user.id;
        const { error, value } = updateGroupAvatarValidation.validate(req.body);
        if (error) {
          return res.status(400).json(GroupDto.error(error.details[0].message));
        }
        const { id } = value; // groupId via roomId mapping below

        // Require file
        if (!req.file || !req.file.buffer) {
          return res.status(400).json(GroupDto.error("Image file is required"));
        }

        // Upload to Cloudinary (square avatar 256x256)
        const uploadResult = await processAndUploadImage(
          req.file.buffer,
          "chaotok/groups/avatars",
          {
            width: 256,
            height: 256,
            fit: "cover",
            format: "webp",
            quality: 85,
          }
        );

        const avatarUrl = uploadResult.secure_url;

        // Update group avatar via roomId
        const updatedGroup = await this.groupService.updateGroupAvatarByRoomId(
          id,
          currentUserId,
          avatarUrl
        );

        // Broadcast real-time update
        const roomId = id;
        SocketBus.emitToRoom(roomId, "group_avatar_updated", {
          roomId,
          avatar: updatedGroup.avatar,
        });
        SocketBus.emitToUser(currentUserId, "group_avatar_updated", {
          roomId,
          avatar: updatedGroup.avatar,
        });

        return res.status(200).json(GroupDto.success({ group: updatedGroup }));
      } catch (error) {
        console.error("Error updating group avatar:", error);
        return res
          .status(500)
          .json(
            GroupDto.error(error.message || "Failed to update group avatar")
          );
      }
    },
  ];

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
      const roomId = id;
      SocketBus.emitToRoom(roomId, "group_owner_changed", {
        roomId,
        newOwnerId,
      });
      return res.status(200).json(GroupDto.success(group));
    } catch (error) {
      return res.status(500).json(GroupDto.error(error));
    }
  };

  // REST rename group -> broadcast
  renameGroup = async (req, res) => {
    try {
      const { id, name } = req.body || {};
      const currentUserId = req.user.id;
      
      console.log('[GroupController] renameGroup called with:', { id, name, currentUserId });
      
      if (!id || !name) {
        return res
          .status(400)
          .json(GroupDto.error("Room ID and name are required"));
      }
      
      const group = await this.groupService.renameGroupByRoomId(
        id,
        name,
        currentUserId
      );
      
      if (!group) {
        return res
          .status(404)
          .json(GroupDto.error("Group not found or this is not a group conversation"));
      }
      
      const roomId = id;
      SocketBus.emitToRoom(roomId, "group_renamed", {
        roomId,
        groupId: group._id,
        newName: group.name,
      });
      return res.status(200).json(GroupDto.success(group));
    } catch (error) {
      console.error("Error in renameGroup:", error);
      return res
        .status(500)
        .json(GroupDto.error(error.message || "Failed to rename group"));
    }
  };

  // REST dissolve group -> broadcast
  dissolveGroup = async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { roomId } = req.body || {};
      if (!roomId) {
        return res.status(400).json(GroupDto.error("Room ID is required"));
      }
      await this.groupService.dissolveGroupByRoomId(roomId, currentUserId);
      SocketBus.emitToRoom(roomId, "group_dissolved", { roomId });
      return res.status(200).json(GroupDto.success({ roomId }));
    } catch (error) {
      return res
        .status(500)
        .json(GroupDto.error(error.message || "Failed to dissolve group"));
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
