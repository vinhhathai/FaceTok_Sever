"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { MessageController, RoomController } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");
const GroupController = require("../controllers/GroupController");

// Group API
router.post("/group", checkLogin, GroupController.createGroup);
router.get("/group/:id", checkLogin, GroupController.getGroupById);


// Room API
// Delete conversation
router.delete("/room/:roomId", checkLogin, RoomController.deleteConversation);

// Get or create room
router.post(
  "/room/get-or-create",
  checkLogin,
  RoomController.getOrCreateRoom
);


// Lấy thông tin phòng 2 user
// router.get("/room/:roomId", checkLogin, RoomController.getRoomById);
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
