"use strict";
//----------------------------------------------------------------
const FriendRequestModel = require("../models/FriendRequestModel");
const UserModel = require("../../user/models/UserModel");
const mongoose = require("mongoose");

class FriendRepository {
  constructor() {
    this.friendRequestModel = FriendRequestModel;
    this.userModel = UserModel;
    this.STATUS = FriendRequestModel.STATUS;
  }

  async getFriendsList(userId) {
    const user = await UserModel.findById(userId)
      .populate("friends", "_id fullName profilePicture email bio")
      .select("friends");

    return user ? user.friends : [];
  }


  async checkIfFriends(userId1, userId2) {
    const user = await this.userModel.findById(userId1).select('friends');
    return user && user.friends.includes(userId2);
  }

  /**
   * Kiểm tra xem đã có lời mời kết bạn giữa hai người dùng chưa
   * @param {string} userId - ID của người dùng thứ nhất  
   * @param {string} targetUserId - ID của người dùng thứ hai
   * @returns {Promise<Object|null>} Thông tin lời mời kết bạn nếu tồn tại
   */
  async checkFriendRequestExists(userId, targetUserId) {
    // Use checkRelationshipExists to find requests in either direction
    return await this.friendRequestModel.findOne({
      $or: [
        { sender: userId, recipient: targetUserId },
        { sender: targetUserId, recipient: userId }
      ]
    });
    
  }

  /**
   * Kiểm tra xem có lời mời kết bạn cụ thể từ senderId đến recipientId hay không
   * @param {string} senderId - ID của người gửi
   * @param {string} recipientId - ID của người nhận
   * @returns {Promise<Object|null>} Thông tin lời mời kết bạn nếu tồn tại
   */
  async checkExactFriendRequest(senderId, recipientId) {
    // Use checkExists for exact sender/recipient match only
    return await FriendRequestModel.checkExists(senderId, recipientId);
  }

  /**
   * Tạo lời mời kết bạn mới
   * @param {string} senderId - ID của người gửi lời mời
   * @param {string} recipientId - ID của người nhận lời mời
   * @returns {Promise<Object>} - Lời mời kết bạn đã tạo
   */
  async createFriendRequest(senderId, recipientId) {
    const newRequest = new this.friendRequestModel({
      sender: senderId,
      recipient: recipientId,
      status: this.STATUS.PENDING
    });

    const savedRequest = await newRequest.save();
    
    // Populate thông tin người gửi và người nhận
    return await this.friendRequestModel.findById(savedRequest._id)
      .populate('sender', '_id fullName profilePicture')
      .populate('recipient', '_id fullName profilePicture');
  }

  /**
   * Lấy lời mời kết bạn theo ID
   * @param {string} requestId - ID của lời mời kết bạn
   * @returns {Promise<Object|null>} - Lời mời kết bạn nếu tồn tại, null nếu không
   */
  async getFriendRequestById(requestId) {
    return await this.friendRequestModel.findById(requestId)
      .populate('sender', '_id fullName profilePicture')
      .populate('recipient', '_id fullName profilePicture');
  }

  /**
   * Lấy danh sách lời mời kết bạn mà người dùng đã nhận
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Array>} - Danh sách lời mời kết bạn
   */
  async getReceivedFriendRequests(userId) {
    return await this.friendRequestModel.find({
      recipient: userId,
      status: this.STATUS.PENDING
    })
      .populate('sender', '_id fullName profilePicture email')
      .sort({ createdAt: -1 });
  }

  /**
   * Lấy danh sách lời mời kết bạn mà người dùng đã gửi
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Array>} - Danh sách lời mời kết bạn
   */
  async getSentFriendRequests(userId) {
    return await this.friendRequestModel.find({
      sender: userId,
      status: this.STATUS.PENDING
    })
      .populate('recipient', '_id fullName profilePicture email')
      .sort({ createdAt: -1 });
  }

  /**
   * Chấp nhận lời mời kết bạn
   * @param {Object} friendRequest - Đối tượng lời mời kết bạn
   * @returns {Promise<Object>} - Lời mời kết bạn đã được chấp nhận và thông tin bạn bè
   */
  async acceptFriendRequest(friendRequest) {
    // Đảm bảo friendRequest được populate đầy đủ
    if (!friendRequest.sender._id) {
      friendRequest = await this.getFriendRequestById(friendRequest._id);
    }

    // Cập nhật trạng thái lời mời kết bạn
    friendRequest.status = this.STATUS.ACCEPTED;
    await friendRequest.save();

    const senderId = friendRequest.sender._id;
    const recipientId = friendRequest.recipient._id;

    // Thêm vào danh sách bạn bè của cả hai người
    const senderUpdate = this.userModel.findByIdAndUpdate(
      senderId,
      { $addToSet: { friends: recipientId } },
      { new: true }
    );
    
    const recipientUpdate = this.userModel.findByIdAndUpdate(
      recipientId,
      { $addToSet: { friends: senderId } },
      { new: true }
    );

    const [sender, recipient] = await Promise.all([senderUpdate, recipientUpdate]);

    return {
      friendRequest,
      friend: friendRequest.sender
    };
  }

  /**
   * Từ chối lời mời kết bạn
   * @param {Object} friendRequest - Đối tượng lời mời kết bạn
   * @returns {Promise<Object>} - Lời mời kết bạn đã bị từ chối
   */
  async rejectFriendRequest(friendRequest) {
    friendRequest.status = this.STATUS.REJECTED;
    return await friendRequest.save();
  }

  /**
   * Xóa lời mời kết bạn
   * @param {string} requestId - ID của lời mời kết bạn
   * @returns {Promise<Object>} - Kết quả xóa
   */
  async deleteFriendRequest(requestId) {
    return await this.friendRequestModel.findByIdAndDelete(requestId);
  }

  /**
   * Xóa mối quan hệ bạn bè giữa hai người dùng
   * @param {string} userId1 - ID của người dùng thứ nhất
   * @param {string} userId2 - ID của người dùng thứ hai
   * @returns {Promise<Array>} - Kết quả cập nhật cho cả hai người dùng
   */
  async removeFriend(userId1, userId2) {
    const user1Update = this.userModel.findByIdAndUpdate(
      userId1,
      { $pull: { friends: userId2 } },
      { new: true }
    );
    
    const user2Update = this.userModel.findByIdAndUpdate(
      userId2,
      { $pull: { friends: userId1 } },
      { new: true }
    );

    // Xóa tất cả lời mời kết bạn giữa hai người dùng (nếu có)
    const requestsDelete = this.friendRequestModel.deleteMany({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    });

    return await Promise.all([user1Update, user2Update, requestsDelete]);
  }
}

module.exports = FriendRepository;
