"use strict";
//----------------------------------------------------------------
const UserModel = require('../../models/UserModel');
const FriendRequestModel = require('../../models/FriendRequestModel');
const mongoose = require('mongoose');

/**
 * Send a friend request to another user
 */
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.user_id;
    const { recipientId } = req.body;

    // Validate recipientId
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    // Check if trying to send to self
    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if recipient exists
    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if a friend request already exists between these users
    const existingRequest = await FriendRequestModel.checkExists(senderId, recipientId);
    
    if (existingRequest) {
      // If request is already accepted, they are friends
      if (existingRequest.status === FriendRequestModel.STATUS.ACCEPTED) {
        return res.status(400).json({ message: 'You are already friends with this user' });
      }
      
      // If there's a pending request from recipient to sender, auto-accept it
      if (existingRequest.status === FriendRequestModel.STATUS.PENDING && 
          existingRequest.sender.toString() === recipientId.toString()) {
        existingRequest.status = FriendRequestModel.STATUS.ACCEPTED;
        await existingRequest.save();
        
        // Update both users' friends arrays
        await UserModel.findByIdAndUpdate(senderId, { $addToSet: { friends: recipientId } });
        await UserModel.findByIdAndUpdate(recipientId, { $addToSet: { friends: senderId } });
        
        return res.status(200).json({ 
          message: 'Friend request accepted',
          friendRequest: existingRequest
        });
      }
      
      // If sender already sent a request to recipient
      if (existingRequest.status === FriendRequestModel.STATUS.PENDING && 
          existingRequest.sender.toString() === senderId.toString()) {
        return res.status(400).json({ message: 'You already sent a friend request to this user' });
      }
      
      // If request was rejected, allow sending again
      if (existingRequest.status === FriendRequestModel.STATUS.REJECTED) {
        existingRequest.status = FriendRequestModel.STATUS.PENDING;
        existingRequest.sender = senderId;
        existingRequest.recipient = recipientId;
        await existingRequest.save();
        
        return res.status(200).json({
          message: 'Friend request sent',
          friendRequest: existingRequest
        });
      }
    }

    // Create a new friend request
    const newFriendRequest = new FriendRequestModel({
      sender: senderId,
      recipient: recipientId,
      status: FriendRequestModel.STATUS.PENDING
    });

    await newFriendRequest.save();

    res.status(200).json({
      message: 'Friend request sent',
      friendRequest: newFriendRequest
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Accept a friend request
 */
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { requestId } = req.body;

    // Find the friend request
    const friendRequest = await FriendRequestModel.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify that the current user is the recipient
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    // Check if request is already accepted
    if (friendRequest.status === FriendRequestModel.STATUS.ACCEPTED) {
      return res.status(400).json({ message: 'Friend request already accepted' });
    }

    // Update friend request status
    friendRequest.status = FriendRequestModel.STATUS.ACCEPTED;
    await friendRequest.save();

    // Update both users' friends arrays
    const sender = friendRequest.sender;
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { friends: sender } });
    await UserModel.findByIdAndUpdate(sender, { $addToSet: { friends: userId } });

    res.status(200).json({
      message: 'Friend request accepted',
      friendRequest
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Reject a friend request
 */
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { requestId } = req.body;

    // Find the friend request
    const friendRequest = await FriendRequestModel.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify that the current user is the recipient
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    // Update friend request status
    friendRequest.status = FriendRequestModel.STATUS.REJECTED;
    await friendRequest.save();

    res.status(200).json({
      message: 'Friend request rejected',
      friendRequest
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Cancel a sent friend request
 */
const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { requestId } = req.body;

    // Find the friend request
    const friendRequest = await FriendRequestModel.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify that the current user is the sender
    if (friendRequest.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    // Delete the friend request
    await FriendRequestModel.findByIdAndDelete(requestId);

    res.status(200).json({
      message: 'Friend request cancelled'
    });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Remove a friend
 */
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { friendId } = req.body;

    // Validate friendId
    if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: 'Invalid friend ID' });
    }

    // Check if users are friends
    const user = await UserModel.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'You are not friends with this user' });
    }

    // Remove friend from both users' friend lists
    await UserModel.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await UserModel.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    // Find and delete any friend request document
    await FriendRequestModel.findOneAndDelete({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId }
      ],
      status: FriendRequestModel.STATUS.ACCEPTED
    });

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get list of friends for the authenticated user
 */
const getFriends = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Find user with populated friends list
    const user = await UserModel.findById(user_id).populate('friends', 'fullName profilePicture email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving friends list'
    });
  }
};

/**
 * Get pending friend requests (sent and received)
 */
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find pending requests where user is recipient (received)
    const receivedRequests = await FriendRequestModel.find({
      recipient: userId,
      status: FriendRequestModel.STATUS.PENDING
    }).populate('sender', 'fullName profilePicture');

    // Find pending requests where user is sender (sent)
    const sentRequests = await FriendRequestModel.find({
      sender: userId,
      status: FriendRequestModel.STATUS.PENDING
    }).populate('recipient', 'fullName profilePicture');

    res.status(200).json({
      received: receivedRequests,
      sent: sentRequests
    });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check friendship status with another user
 */
const checkFriendshipStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { targetUserId } = req.params;

    // Validate targetUserId
    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if target user exists
    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if users are friends
    const user = await UserModel.findById(userId);
    if (user.friends.includes(targetUserId)) {
      return res.status(200).json({ status: 'friends' });
    }

    // Check if there's a pending request
    const pendingRequest = await FriendRequestModel.findOne({
      $or: [
        { sender: userId, recipient: targetUserId },
        { sender: targetUserId, recipient: userId }
      ],
      status: FriendRequestModel.STATUS.PENDING
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === userId.toString()) {
        return res.status(200).json({ 
          status: 'request_sent',
          requestId: pendingRequest._id 
        });
      } else {
        return res.status(200).json({ 
          status: 'request_received',
          requestId: pendingRequest._id 
        });
      }
    }

    // No relationship
    return res.status(200).json({ status: 'not_friends' });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  checkFriendshipStatus
}; 