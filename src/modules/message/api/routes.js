"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { MessageController, RoomController } = require("../controllers/");
const { checkLogin, handleMediaUpload } = require("../../../shared/middlewares");
const GroupController = require("../controllers/GroupController");

// Group API
router.put("/group/change-owner", checkLogin, GroupController.changeGroupOwner);
router.put("/group/rename", checkLogin, GroupController.renameGroup);
router.post("/group", checkLogin, GroupController.createGroup);
router.get("/group/:id", checkLogin, GroupController.getGroupById);
router.post("/group/invite", checkLogin, RoomController.inviteToGroup);
router.post("/group/dissolve", checkLogin, GroupController.dissolveGroup);
// Update group avatar by roomId (id=roomId)
router.post("/group/update-avatar", checkLogin, GroupController.updateAvatar);

// Room API
// Delete conversation
router.delete("/room/:roomId", checkLogin, RoomController.deleteConversation);
// Kick out member
router.post("/room/kick-out", checkLogin, RoomController.kickOutMember);

router.post("/room/leave", checkLogin, RoomController.leaveGroup);

// Get or create room
router.post("/room/get-or-create", checkLogin, RoomController.getOrCreateRoom);

// Get room by id
router.get("/room/:roomId", checkLogin, RoomController.getRoomById);
// Get messages in room
router.get("/room/:roomId/messages", checkLogin, MessageController.getMessages);

// Get rooms of user
router.get("/rooms", checkLogin, RoomController.getRooms);

// Create message in room (with optional media attachments)
router.post(
  "/room/:roomId/message",
  checkLogin,
  handleMediaUpload, // Handle media files (up to 5 files, 50MB each)
  MessageController.createMessageInRoom
);

// Revoke message
router.post("/revoke", checkLogin, MessageController.revokeMessage);

module.exports = router;
