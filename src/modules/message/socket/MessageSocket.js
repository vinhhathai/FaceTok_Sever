"use strict";
//----------------------------------------------------------------
const SocketController = require("../controllers/SocketController");

/**
 * Socket.IO handler for message module
 */
class MessageSocket {
  constructor(io) {
    this.io = io;
    this.socketController = SocketController;
    this.userSocketMap = new Map(); // Map userId to socketId
    this.socketIdMap = new Map(); // Map socketId to userId
    this.userRoomsMap = new Map(); // Map userId to Set of roomIds
  }
  /**
   * Initialize socket events
   */
  init() {
    const messageNamespace = this.io.of("/message");

    messageNamespace.on("connection", (socket) => {
      // Auto-authenticate from httpOnly cookie (secure approach)
      const cookieToken = socket.request.cookies?.auth_token;
      
      if (cookieToken) {
        // Immediately authenticate using cookie token
        this.socketController.authenticateUser(cookieToken).then(authResult => {
          if (authResult.success) {
            const userId = authResult.userId;
            
            // Update maps
            this.userSocketMap.set(userId, socket.id);
            this.socketIdMap.set(socket.id, userId);
            socket.userId = userId;
            
            // Join personal room
            socket.join(`user:${userId}`);
            socket.emit("auth_success", { userId, method: "cookie" });
          } else {
            socket.emit("auth_error", { 
              message: "Cookie authentication failed",
              detail: authResult.message 
            });
          }
        });
      }

      // Xử lý khi socket ngắt kết nối
      socket.on("disconnect", () => {
        const userId = this.socketIdMap.get(socket.id);
        if (userId) {
          // Xóa khỏi các maps
          this.socketIdMap.delete(socket.id);
          this.userSocketMap.delete(userId);

          // Xóa khỏi userRoomsMap
          this.userRoomsMap.delete(userId);

          // debug removed
        } else {
          // debug removed
        }
      });

      // Handle user authentication (fallback for manual auth or mobile apps)
      socket.on("authenticate", async (accessToken) => {
        // If already authenticated via cookie, skip
        if (socket.userId) {
          socket.emit("auth_success", { userId: socket.userId, method: "already_authenticated" });
          return;
        }
        
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
        let roomId = data.roomId;
        if (!socket.userId) {
          socket.emit("room_error", { message: "Not authenticated" });
          return;
        }

        if (roomId) {
          const roomName = `room:${roomId}`;

          // Lấy hoặc tạo set phòng của người dùng
          let userRooms = this.userRoomsMap.get(socket.userId);
          if (!userRooms) {
            userRooms = new Set();
            this.userRoomsMap.set(socket.userId, userRooms);
          }

          // Kiểm tra xem đã theo dõi phòng này chưa
          if (userRooms.has(roomId)) {
            // debug removed
            return;
          }

          // Chỉ tham gia nếu chưa trong phòng
          const rooms = Array.from(socket.rooms);
          if (!rooms.includes(roomName)) {
            socket.join(roomName);
            // Thêm vào danh sách phòng đã theo dõi
            userRooms.add(roomId);
            // debug removed
            socket.emit("room_joined", { roomId });
          } else {
            // Đã trong phòng, không cần join lại
            // Thêm vào danh sách phòng đã theo dõi
            userRooms.add(roomId);
            // debug removed
          }
        }
      });

      // Xử lý rời phòng chat
      socket.on("leave_room", (data) => {
        if (!socket.userId) {
          socket.emit("room_error", { message: "Not authenticated" });
          return;
        }

        let roomId = data.roomId || data;
        if (roomId) {
          const roomName = `room:${roomId}`;

          // Lấy set phòng của người dùng
          let userRooms = this.userRoomsMap.get(socket.userId);
          if (userRooms) {
            // Kiểm tra xem có theo dõi phòng này không
            if (!userRooms.has(roomId)) {
              // debug removed
              return;
            }
            // Xóa khỏi danh sách phòng đã theo dõi
            userRooms.delete(roomId);
          }

          // Chỉ rời phòng nếu đang trong phòng
          const rooms = Array.from(socket.rooms);
          if (rooms.includes(roomName)) {
            socket.leave(roomName);
            // debug removed
            socket.emit("room_left", { roomId });
          } else {
            // debug removed
          }
        }
      });

      // NOTE: All group management events have been moved to REST:
      // - rename_group -> PUT /message/group/rename
      // - dissolve_group -> POST /message/group/dissolve
      // - change_group_owner -> PUT /message/group/change-owner
      // - leave_group -> POST /message/room/leave
      // - kick_member -> POST /message/room/kick-out
      // - invite_member -> POST /message/group/invite
      // - send_message -> POST /message/room/:roomId/message
      // - revoke_message -> POST /message/revoke
      // - update_group_avatar -> POST /message/group/update-avatar
    });
  }
}

module.exports = MessageSocket;
