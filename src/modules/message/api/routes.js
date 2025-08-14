"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { MessageController, RoomController } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");
const GroupController = require("../controllers/GroupController");

// Group API
// router.put("/group/change-owner", checkLogin, GroupController.changeGroupOwner);
router.post("/group", checkLogin, GroupController.createGroup);
router.get("/group/:id", checkLogin, GroupController.getGroupById);
router.post("/group/invite", checkLogin, RoomController.inviteToGroup);
// Update group avatar by roomId (id=roomId)
router.post(
  "/group/update-avatar",
  checkLogin,
  GroupController.updateAvatar
);

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

// Create message in room
router.post(
  "/room/:roomId/message",
  checkLogin,
  MessageController.createMessageInRoom
);

module.exports = router;
