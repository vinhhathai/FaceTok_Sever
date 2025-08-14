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
    this.userRoomsMap = new Map(); // Map userId to Set of roomIds
  }
  /**
   * Initialize socket events
   */
  init() {
    const messageNamespace = this.io.of("/message");

    messageNamespace.on("connection", (socket) => {
      // debug removed

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

      socket.on("revoke_message", async (data) => {
        if (!socket.userId) {
          socket.emit("message_error", { message: "Not authenticated" });
          return;
        }

        if (!data.messageId) {
          socket.emit("message_error", { message: "Message ID is required" });
          return;
        }

        const result = await this.socketController.revokeMessage(
          data.messageId,
          socket.userId
        );

        if (!result.success) {
          socket.emit("message_error", { message: result.message });
          return;
        }

        // Emit message_revoked to the sender
        socket.emit("message_revoked", { messageId: data.messageId });

        // Emit message_revoked to all users in the room
        // First, we need to find the room that contains this message
        const message =
          await this.socketController.messageService.messageRepository.messageModel.findById(
            data.messageId
          );
        if (message && message.roomId) {
          const room = await this.socketController.roomService.getRoomById(
            message.roomId.toString()
          );
          if (room) {
            // Emit to all users in the room
            socket
              .to(`room:${room._id}`)
              .emit("message_revoked", { messageId: data.messageId });
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

        // Tìm thông tin người gửi từ danh sách members của phòng
        const sender = room.members.find(
          (member) => member._id.toString() === socket.userId.toString()
        );

        // Tạo đối tượng tin nhắn để gửi
        const messageData = {
          _id: message._id,
          senderId: message.senderId,
          content: message.content,
          roomId: message.roomId,
          createdAt: message.createdAt,
          // Thêm thông tin người gửi để client hiển thị ngay không cần query
          sender: sender
            ? {
                _id: sender._id,
                fullName: sender.fullName,
                profilePicture: sender.profilePicture,
              }
            : undefined,
        };

        // Gửi tin nhắn đến người gửi
        socket.emit("message_received", messageData);

        // Gửi tin nhắn đến phòng
        socket.to(`room:${room._id}`).emit("message_received", messageData);

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
        // debug removed
      });

      // Xử lý đổi tên nhóm
      socket.on("rename_group", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data.roomId || data.groupId; // tạm hỗ trợ groupId để tránh gãy client cũ
        if (!roomId || !data.name) {
          socket.emit("group_error", {
            message: "Room ID and name are required",
          });
          return;
        }

        try {
          // Gọi service để đổi tên nhóm
          const result = await this.socketController.renameGroup(
            roomId,
            data.name,
            socket.userId
          );

          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          const { group, room, message } = result.data;

          // Tạo data để gửi cho tất cả thành viên (kèm roomId để FE map conversation nhanh)
          const groupData = {
            groupId: group._id,
            roomId: room && room._id ? room._id.toString() : undefined,
            newName: group.name,
            updatedAt: group.updatedAt,
            updatedBy: socket.userId,
          };

          // Gửi thông báo thành công cho người đổi tên
          socket.emit("group_renamed", groupData);

          // Gửi thông báo cho tất cả thành viên trong nhóm
          if (room && room.members) {
            for (const member of room.members) {
              const memberSocketId = this.userSocketMap.get(
                member._id.toString()
              );
              if (memberSocketId && member._id.toString() !== socket.userId) {
                this.io
                  .of("/message")
                  .to(`user:${member._id}`)
                  .emit("group_renamed", groupData);
              }
            }
          }

          // Nếu đã tạo được tin nhắn hệ thống (đổi tên nhóm), emit ngay message_received tới phòng
          if (message && room) {
            // Tìm thông tin người gửi
            const sender = room.members.find(
              (m) => m._id.toString() === socket.userId.toString()
            );

            const messageData = {
              _id: message._id,
              senderId: message.senderId,
              content: message.content,
              roomId: message.roomId,
              createdAt: message.createdAt,
              sender: sender
                ? {
                    _id: sender._id,
                    fullName: sender.fullName,
                    profilePicture: sender.profilePicture,
                  }
                : undefined,
            };

            // Gửi tới người đổi tên (để hiện ngay trong khung chat của họ)
            socket.emit("message_received", messageData);

            // Gửi tới toàn bộ phòng
            socket.to(`room:${room._id}`).emit("message_received", messageData);
          }

          // debug removed
        } catch (error) {
          console.error("Error renaming group:", error);
          socket.emit("group_error", {
            message: error.message || "Failed to rename group",
          });
        }
      });

      // Giải tán nhóm (owner only)
      socket.on("dissolve_group", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data.roomId;
        if (!roomId) {
          socket.emit("group_error", { message: "Room ID is required" });
          return;
        }

        try {
          const result = await this.socketController.dissolveGroup(
            roomId,
            socket.userId
          );
          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          const room = result.data.room;
          // Thông báo tới tất cả thành viên: group_dissolved
          const payload = { roomId };
          // gửi cho owner
          socket.emit("group_dissolved", payload);
          // gửi các thành viên khác
          if (room && room.members) {
            for (const member of room.members) {
              if (member._id.toString() === socket.userId.toString()) continue;
              this.io
                .of("/message")
                .to(`user:${member._id}`)
                .emit("group_dissolved", payload);
            }
          }
        } catch (error) {
          socket.emit("group_error", {
            message: error.message || "Failed to dissolve group",
          });
        }
      });

      // Chuyển quyền trưởng nhóm (owner only)
      socket.on("change_group_owner", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data?.roomId;
        const newOwnerId = data?.newOwnerId;
        if (!roomId || !newOwnerId) {
          socket.emit("group_error", { message: "Room ID and new owner ID are required" });
          return;
        }

        try {
          const result = await this.socketController.changeGroupOwner(
            roomId,
            socket.userId,
            newOwnerId
          );

          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          const { group, room, message } = result.data;

          const payload = {
            roomId,
            groupId: group?._id?.toString?.() || group?._id || undefined,
            newOwnerId: group?.ownerId?.toString?.() || newOwnerId,
            updatedAt: group?.updatedAt,
          };

          // Thông báo tới người thực hiện
          socket.emit("group_owner_changed", payload);
          if (message) {
            // Gửi message ngay tới người thực hiện
            socket.emit("message_received", {
              _id: message._id,
              senderId: message.senderId,
              content: message.content,
              roomId: message.roomId,
              createdAt: message.createdAt,
            });
          }

          // Thông báo tới toàn bộ thành viên phòng
          if (room && room.members) {
            for (const member of room.members) {
              const memberId = member._id.toString();
              if (memberId === socket.userId.toString()) continue;
              this.io.of("/message").to(`user:${memberId}`).emit("group_owner_changed", payload);
              if (message) {
                this.io.of("/message").to(`user:${memberId}`).emit("message_received", {
                  _id: message._id,
                  senderId: message.senderId,
                  content: message.content,
                  roomId: message.roomId,
                  createdAt: message.createdAt,
                });
              }
            }
          }
        } catch (error) {
          socket.emit("group_error", { message: error.message || "Failed to change group owner" });
        }
      });

      // Thành viên rời nhóm
      socket.on("leave_group", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data?.roomId;
        if (!roomId) {
          socket.emit("group_error", { message: "Room ID is required" });
          return;
        }

        try {
          const result = await this.socketController.leaveGroup(
            roomId,
            socket.userId
          );
          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          // Emit tới chính user: đã rời nhóm
          socket.emit("group_left", { roomId });
          // Rời socket room
          const roomName = `room:${roomId}`;
          const rooms = Array.from(socket.rooms);
          if (rooms.includes(roomName)) {
            socket.leave(roomName);
          }

          const room = result.data.room;
          // Thông báo tới các thành viên còn lại và gửi message hệ thống
          // Lấy tên người rời nhóm
          let actorName = "Một thành viên";
          try {
            const user = await this.socketController.messageService.userRepository.findById(
              socket.userId
            );
            if (user && user.fullName) actorName = user.fullName;
          } catch {}

          const systemMessage = `${actorName} đã rời nhóm`;

          // Chọn một thành viên còn lại làm sender cho message hệ thống để vượt qua kiểm tra membership
          const remainingMemberId = room.members?.[0]?._id?.toString?.();
          let createdMsg = null;
          if (remainingMemberId) {
            createdMsg = await this.socketController.createMessageInRoom(
              remainingMemberId,
              roomId,
              systemMessage
            );
          }
          const message = createdMsg?.success ? createdMsg.data.message : null;

          if (room && room.members) {
            for (const member of room.members) {
              const memberId = member._id.toString();
              if (memberId === socket.userId.toString()) continue;
              this.io
                .of("/message")
                .to(`user:${memberId}`)
                .emit("group_member_left", { roomId, userId: socket.userId });
              if (message) {
                this.io
                  .of("/message")
                  .to(`user:${memberId}`)
                  .emit("message_received", {
                    _id: message._id,
                    senderId: message.senderId,
                    content: message.content,
                    roomId: message.roomId,
                    createdAt: message.createdAt,
                  });
              }
            }
          }
        } catch (error) {
          socket.emit("group_error", {
            message: error.message || "Failed to leave group",
          });
        }
      });

      // Owner kick a member from group
      socket.on("kick_member", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data?.roomId;
        const targetUserId = data?.userId || data?.kickOutUserId;
        if (!roomId || !targetUserId) {
          socket.emit("group_error", { message: "Room ID and user ID are required" });
          return;
        }

        try {
          const result = await this.socketController.kickOutMember(
            roomId,
            socket.userId,
            targetUserId
          );

          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          const { room, message } = result.data;

          // Thông báo tới owner (người kick)
          socket.emit("group_member_kicked", { roomId, userId: targetUserId });

          // Buộc target rời khỏi socket room và nhận thông báo
          const targetSocketId = this.userSocketMap.get(targetUserId);
          if (targetSocketId) {
            // thông báo riêng đến nạn nhân
            this.io
              .of("/message")
              .to(`user:${targetUserId}`)
              .emit("group_member_kicked", { roomId, userId: targetUserId });

            // đảm bảo socket target rời khỏi room
            const targetSocket = this.io.of("/message").sockets.get(targetSocketId);
            if (targetSocket) {
              const roomName = `room:${roomId}`;
              const rooms = Array.from(targetSocket.rooms);
              if (rooms.includes(roomName)) {
                targetSocket.leave(roomName);
              }
            }
          }

          // Emit tới các thành viên còn lại trong nhóm
          if (room && room.members) {
            for (const member of room.members) {
              const memberId = member._id.toString();
              if (memberId === socket.userId.toString()) continue;
              this.io
                .of("/message")
                .to(`user:${memberId}`)
                .emit("group_member_kicked", { roomId, userId: targetUserId });

              if (message) {
                this.io
                  .of("/message")
                  .to(`user:${memberId}`)
                  .emit("message_received", {
                    _id: message._id,
                    senderId: message.senderId,
                    content: message.content,
                    roomId: message.roomId,
                    createdAt: message.createdAt,
                  });
              }
            }
          }
        } catch (error) {
          socket.emit("group_error", {
            message: error.message || "Failed to kick member",
          });
        }
      });

      // Invite member to group
      socket.on("invite_member", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data?.roomId;
        const targetUserId = data?.userId || data?.targetUserId;
        if (!roomId || !targetUserId) {
          socket.emit("group_error", { message: "Room ID and user ID are required" });
          return;
        }

        try {
          const result = await this.socketController.inviteMember(
            roomId,
            socket.userId,
            targetUserId
          );

          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          const { room, message } = result.data;

          // Thông báo tới người mời
          socket.emit("group_member_invited", { roomId, userId: targetUserId });

          // Gửi message hệ thống tới người mời để hiển thị realtime
          if (message) {
            socket.emit("message_received", {
              _id: message._id,
              senderId: message.senderId,
              content: message.content,
              roomId: message.roomId,
              createdAt: message.createdAt,
            });
          }

          // Nếu người được mời đang online, đưa họ join socket room
          const targetSocketId = this.userSocketMap.get(targetUserId);
          if (targetSocketId) {
            this.io
              .of("/message")
              .to(`user:${targetUserId}`)
              .emit("group_member_invited", { roomId, userId: targetUserId });
            const targetSocket = this.io.of("/message").sockets.get(targetSocketId);
            if (targetSocket) {
              const roomName = `room:${roomId}`;
              const rooms = Array.from(targetSocket.rooms);
              if (!rooms.includes(roomName)) {
                targetSocket.join(roomName);
              }
            }
          }

          // Emit tới các thành viên hiện tại trong nhóm
          if (room && room.members) {
            for (const member of room.members) {
              const memberId = member._id.toString();
              if (memberId === socket.userId.toString()) continue;
              this.io
                .of("/message")
                .to(`user:${memberId}`)
                .emit("group_member_invited", { roomId, userId: targetUserId });

              if (message) {
                this.io
                  .of("/message")
                  .to(`user:${memberId}`)
                  .emit("message_received", {
                    _id: message._id,
                    senderId: message.senderId,
                    content: message.content,
                    roomId: message.roomId,
                    createdAt: message.createdAt,
                  });
              }
            }
          }
        } catch (error) {
          socket.emit("group_error", {
            message: error.message || "Failed to invite member",
          });
        }
      });

      // Update group avatar (socket event expects avatarUrl already uploaded)
      socket.on("update_group_avatar", async (data) => {
        if (!socket.userId) {
          socket.emit("group_error", { message: "Not authenticated" });
          return;
        }

        const roomId = data?.roomId;
        const avatarUrl = data?.avatarUrl;
        if (!roomId || !avatarUrl) {
          socket.emit("group_error", { message: "Room ID and avatar URL are required" });
          return;
        }

        try {
          const result = await this.socketController.updateGroupAvatar(
            roomId,
            socket.userId,
            avatarUrl
          );

          if (!result.success) {
            socket.emit("group_error", { message: result.message });
            return;
          }

          const { group, room, message } = result.data;

          // Notify updater
          socket.emit("group_avatar_updated", { roomId, avatar: group?.avatar });

          // Broadcast to members
          if (room && room.members) {
            for (const member of room.members) {
              const memberId = member._id.toString();
              if (memberId === socket.userId.toString()) continue;
              this.io
                .of("/message")
                .to(`user:${memberId}`)
                .emit("group_avatar_updated", { roomId, avatar: group?.avatar });

              if (message) {
                this.io
                  .of("/message")
                  .to(`user:${memberId}`)
                  .emit("message_received", {
                    _id: message._id,
                    senderId: message.senderId,
                    content: message.content,
                    roomId: message.roomId,
                    createdAt: message.createdAt,
                  });
              }
            }
          }

          // Also deliver the system message to the updater
          if (message) {
            socket.emit("message_received", {
              _id: message._id,
              senderId: message.senderId,
              content: message.content,
              roomId: message.roomId,
              createdAt: message.createdAt,
            });
          }
        } catch (error) {
          socket.emit("group_error", {
            message: error.message || "Failed to update group avatar",
          });
        }
      });
    });
  }
}

module.exports = MessageSocket;
