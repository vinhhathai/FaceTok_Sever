"use strict";
//----------------------------------------------------------------
const { SocketController } = require("../controllers");

/**
 * Socket.IO handler for message module
 */
class MessageSocket {
  constructor(io) {
    this.io = io;
    this.socketController = SocketController;
    this.userSocketMap = new Map(); // Map userId to socketId
    this.socketIdMap = new Map(); // Map socketId to userId
  }
  /**
   * Initialize socket events
   */
  init() {
    const messageNamespace = this.io.of("/message");

    messageNamespace.on("connection", (socket) => {
      console.log(
        `Socket connected: ${socket.id} (total active: ${
          this.socketIdMap.size + 1
        })`
      );
      // Handle user authentication
      socket.on("authenticate", async (accessToken) => {
        if (!accessToken.accessToken) {
          socket.emit("auth_error", { message: "Token is required" });
          return;
        }
        const token = accessToken.accessToken;

        // Xác thực người dùng
        const authResult = await this.socketController.authenticateUser(token);

        if (!authResult.success) {
          socket.emit("auth_error", { message: authResult.message });
          return;
        }

        const userId = authResult.userId;

        // Kiểm tra xem userId này đã có socket nào chưa
        const existingSocketId = this.userSocketMap.get(userId);

        // Nếu có kết nối cũ khác với kết nối hiện tại
        if (existingSocketId && existingSocketId !== socket.id) {
          // Thông báo cho tất cả các thiết bị (bao gồm cả thiết bị cũ) về kết nối mới
          this.io
            .of("/message")
            .to(`user:${userId}`)
            .emit("new_device_connected", {
              message: "Your account was connected from another device",
            });
        }

        // Cập nhật maps
        this.userSocketMap.set(userId, socket.id);
        this.socketIdMap.set(socket.id, userId);
        socket.userId = userId;

        // Join phòng cá nhân để nhận tin nhắn trực tiếp
        socket.join(`user:${userId}`);

        // Kiểm tra các phòng mà socket đã tham gia
        socket.emit("auth_success", { userId });
      });

      // Xử lý tham gia phòng chat
      socket.on("join_room", (data) => {
        console.log("join_room", data.roomId);
        let roomId = data.roomId;
        if (!socket.userId) {
          socket.emit("room_error", { message: "Not authenticated" });
          return;
        }

        if (roomId) {
          const roomName = `room:${roomId}`;
          // Chỉ tham gia nếu chưa trong phòng
          const rooms = Array.from(socket.rooms);
          if (!rooms.includes(roomName)) {
            socket.join(roomName);
            socket.emit("room_joined", { roomId });
          }
          console.log("rooms", rooms);
        }
      });

      // Xử lý rời phòng chat
      socket.on("leave_room", (roomId) => {
        if (!socket.userId) {
          socket.emit("room_error", { message: "Not authenticated" });
          return;
        }

        if (roomId) {
          const roomName = `room:${roomId}`;

          // Chỉ rời phòng nếu đang trong phòng
          const rooms = Array.from(socket.rooms);
          if (rooms.includes(roomName)) {
            socket.leave(roomName);
            socket.emit("room_left", { roomId });
          }
        }
      });

      // Xử lý gửi tin nhắn
      socket.on("send_message", async (data) => {
        if (!socket.userId) {
          socket.emit("message_error", { message: "Not authenticated" });
          return;
        }

        // Yêu cầu phải có roomId
        if (!data.roomId) {
          socket.emit("message_error", { message: "Room ID is required" });
          return;
        }

        // Gửi tin nhắn trực tiếp vào phòng đã tồn tại
        const result = await this.socketController.createMessageInRoom(
          socket.userId,
          data.roomId,
          data.content
        );

        if (!result.success) {
          socket.emit("message_error", { message: result.message });
          return;
        }

        // Kết quả đã bao gồm cả message và room
        const { message, room } = result.data;

        // Tạo đối tượng tin nhắn để gửi
        const messageData = {
          _id: message._id,
          senderId: message.senderId,
          content: message.content,
          roomId: message.roomId,
          createdAt: message.createdAt,
        };

        // Gửi tin nhắn đến người gửi
        socket.emit("message_received", messageData);

        // Gửi tin nhắn đến phòng
        socket.to(`room:${room._id}`).emit("message_received", messageData);
        console.log("meme bẻ: " + room)

        // Gửi thông báo đến các thành viên khác trong phòng
        const otherMembers = room.members
          .filter((member) => member._id.toString() !== socket.userId)
          .map((member) => member._id.toString());

        for (const memberId of otherMembers) {
          const receiverSocketId = this.userSocketMap.get(memberId);
          if (receiverSocketId) {
            this.io
              .of("/message")
              .to(`user:${memberId}`)
              .emit("new_message_notification", {
                message: messageData,
              });
          }
        }
      });
    });
  }
}

module.exports = MessageSocket;
