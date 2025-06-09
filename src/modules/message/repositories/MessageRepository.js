"use strict";
//----------------------------------------------------------------
const MessageModel = require("../models/MessageModel");
const RoomModel = require("../models/RoomModel");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const UserModel = require("../../../modules/user/models/UserModel");

/**
 * Repository cho các thao tác với tin nhắn và phòng chat
 */
class MessageRepository {
  constructor() {
    this.messageModel = MessageModel;
    this.roomModel = RoomModel;
    this.userModel = UserModel;
  }

  /**
   * Tạo tin nhắn mới
   * @param {string} senderId - ID người gửi
   * @param {string} roomId - ID phòng chat
   * @param {string} content - Nội dung tin nhắn
   * @returns {Promise<Object>} - Tin nhắn đã tạo
   */
  async createMessage(senderId, roomId, content) {
    const message = new this.messageModel({
      senderId,
      roomId,
      content,
    });
    return await message.save();
  }

  /**
   * Lấy tin nhắn trong phòng chat
   * @param {string} roomId - ID phòng chat
   * @param {number} limit - Số lượng tin nhắn tối đa
   * @param {number} skip - Số tin nhắn bỏ qua (phân trang)
   * @returns {Promise<Array>} - Danh sách tin nhắn
   */
  async getMessagesByRoomId(roomId, limit = 20, skip = 0) {
    return await this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian, mới nhất trước
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'fullName profilePicture')
      .lean();
  }

  /**
   * Tạo phòng chat mới giữa hai người dùng
   * @param {string} userId1 - ID người dùng thứ nhất
   * @param {string} userId2 - ID người dùng thứ hai
   * @returns {Promise<Object>} - Phòng chat đã tạo
   */
  async createRoom(userId1, userId2) {
    const room = new this.roomModel({
      members: [userId1, userId2],
      isGroup: false,
    });
    return await room.save();
  }

  /**
   * Tìm phòng chat giữa hai người dùng
   * @param {string} userId1 - ID người dùng thứ nhất
   * @param {string} userId2 - ID người dùng thứ hai
   * @returns {Promise<Object>} - Phòng chat nếu tồn tại
   */
  async findRoomByMembers(userId1, userId2) {
    return await this.roomModel.findOne({
      members: { $all: [userId1, userId2] },
      isGroup: false,
    });
  }

  /**
   * Tìm phòng chat giữa hai người dùng, nếu không tồn tại thì tạo mới
   * Phương thức này giúp tránh race condition khi nhiều yêu cầu đồng thời
   * @param {string} userId1 - ID người dùng thứ nhất
   * @param {string} userId2 - ID người dùng thứ hai
   * @returns {Promise<Object>} - Phòng chat đã tìm hoặc tạo
   */
  async findRoomByMembersOrCreate(userId1, userId2) {
    // Tìm phòng trước
    const existingRoom = await this.findRoomByMembers(userId1, userId2);
    
    // Nếu đã tồn tại, trả về phòng đó
    if (existingRoom) {
      return await this.roomModel.findById(existingRoom._id)
        .populate('members', 'fullName profilePicture');
    }
    
    // Nếu không tìm thấy, tạo phòng mới với cơ chế atomic
    const newRoom = new this.roomModel({
      members: [userId1, userId2],
      isGroup: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Lưu phòng mới và trả về kết quả
    await newRoom.save();
    
    // Trả về phòng với dữ liệu đã populate
    return await this.roomModel.findById(newRoom._id)
      .populate('members', 'fullName profilePicture');
  }

  /**
   * Tìm phòng chat theo ID
   * @param {string} roomId - ID phòng chat
   * @returns {Promise<Object>} - Phòng chat với thông tin người dùng
   */
  async findRoomById(roomId) {
    return await this.roomModel.findById(roomId)
      .populate('members', 'fullName profilePicture');
  }

  /**
   * Lấy danh sách phòng chat của người dùng
   * @param {string} userId - ID người dùng
   * @returns {Promise<Array>} - Danh sách phòng chat
   */
  async getUserRooms(userId) {
    return await this.roomModel.find({
      members: userId
    })
    .populate('members', 'fullName profilePicture')
    .populate('lastMessage')
    .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật, mới nhất trước
  }

  /**
   * Cập nhật tin nhắn cuối cùng của phòng chat
   * @param {string} roomId - ID phòng chat
   * @param {string} messageId - ID tin nhắn cuối cùng
   * @returns {Promise<Object>} - Phòng chat đã cập nhật
   */
  async updateRoomLastMessage(roomId, messageId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { lastMessage: messageId, updatedAt: new Date() },
      { new: true }
    );
  }
}

module.exports = MessageRepository;
