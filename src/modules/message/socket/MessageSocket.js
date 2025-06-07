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
        socket.emit("auth_success", { userId });
      });

      // Xử lý tham gia phòng chat
      socket.on("join_room", (roomId) => {
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

        // Gọi đến SocketController để gửi tin nhắn
        const result = await this.socketController.sendMessage(
          socket.userId,
          data.receiverId,
          data.content
        );

        if (!result.success) {
          socket.emit("message_error", { message: result.message });
          return;
        }

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

        // Gửi thông báo đến các thành viên khác trong phòng
        const otherMembers = room.members
          .filter((member) => member.toString() !== socket.userId)
          .map((member) => member.toString());

        for (const memberId of otherMembers) {
          const receiverSocketId = this.userSocketMap.get(memberId);
          if (receiverSocketId) {
            this.io
              .of("/message")
              .to(`user:${memberId}`)
              .emit("new_message_notification", {
                message: messageData,
                room: room._id,
              });
          }
        }
      });

      // Lấy danh sách phòng chat của người dùng
      socket.on("get_rooms", async () => {
        if (!socket.userId) {
          socket.emit("rooms_error", { message: "Not authenticated" });
          return;
        }

        const result = await this.socketController.getUserRooms(socket.userId);

        if (!result.success) {
          socket.emit("rooms_error", { message: result.message });
          return;
        }

        socket.emit("rooms_list", result.data);
      });

      // Lấy tin nhắn trong phòng
      socket.on("get_messages", async (data) => {
        if (!socket.userId) {
          socket.emit("messages_error", { message: "Not authenticated" });
          return;
        }

        const result = await this.socketController.getMessages(
          data.roomId,
          data.limit,
          data.skip
        );

        if (!result.success) {
          socket.emit("messages_error", { message: result.message });
          return;
        }

        socket.emit("messages_list", result.data);
      });

      // Xử lý ngắt kết nối
      socket.on("disconnect", () => {
        const userId = this.socketIdMap.get(socket.id);

        if (userId) {
          this.socketIdMap.delete(socket.id);

          // Kiểm tra xem người dùng còn socket nào khác không
          const currentSocketForUser = this.userSocketMap.get(userId);
          if (currentSocketForUser === socket.id) {
            // Nếu socket hiện tại là socket duy nhất của user, xóa user khỏi map
            this.userSocketMap.delete(userId);
          }
        }
      });
    });
  }
}

module.exports = MessageSocket;
