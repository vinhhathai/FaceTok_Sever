"use strict";
//----------------------------------------------------------------
const MessageModel = require('../../models/MessageModel');
const UserModel = require('../../models/UserModel');

/**
 * Get all conversations for the authenticated user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find all messages where the current user is either sender or receiver
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });

    // Extract unique conversation partners
    const conversationPartners = new Map();

    for (const message of messages) {
      // Determine the other user in the conversation
      const partnerId = message.senderId.toString() === userId.toString() 
        ? message.receiverId 
        : message.senderId;
      
      const partnerIdStr = partnerId.toString();
      
      // Only add this conversation if we haven't seen it yet
      if (!conversationPartners.has(partnerIdStr)) {
        conversationPartners.set(partnerIdStr, {
          id: MessageModel.getConversationId(userId, partnerId),
          partnerId: partnerId,
          lastMessage: message.text,
          timestamp: message.createdAt,
          unread: message.receiverId.toString() === userId.toString() && !message.read ? 1 : 0
        });
      }
    }

    // Get user details for all conversation partners
    const partnerIds = Array.from(conversationPartners.keys());
    const partners = await UserModel.find(
      { _id: { $in: partnerIds } },
      { _id: 1, fullName: 1, profilePicture: 1 }
    );

    // Build the final result with user details
    const result = [];
    for (const partner of partners) {
      const conversation = conversationPartners.get(partner._id.toString());
      
      result.push({
        id: conversation.id,
        user: {
          _id: partner._id,
          fullName: partner.fullName,
          profilePicture: partner.profilePicture || ''
        },
        lastMessage: conversation.lastMessage,
        timestamp: conversation.timestamp,
        unread: conversation.unread
      });
    }

    // Sort by most recent message
    result.sort((a, b) => b.timestamp - a.timestamp);

    res.json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get messages for a specific conversation
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { conversationId } = req.params;
    
    // Extract the two user IDs from the conversation ID
    const [userId1, userId2] = conversationId.split('_');
    
    // Verify that the current user is part of this conversation
    if (userId.toString() !== userId1 && userId.toString() !== userId2) {
      return res.status(403).json({ message: 'You do not have access to this conversation' });
    }
    
    // The other user's ID
    const otherUserId = userId.toString() === userId1 ? userId2 : userId1;
    
    // Get messages between these two users
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read if current user is the receiver
    const unreadMessages = messages.filter(
      msg => msg.receiverId.toString() === userId.toString() && !msg.read
    );
    
    if (unreadMessages.length > 0) {
      await MessageModel.updateMany(
        { _id: { $in: unreadMessages.map(msg => msg._id) } },
        { $set: { read: true } }
      );
    }
    
    // Format messages for the client
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.senderId,
      text: msg.text,
      timestamp: msg.createdAt,
      read: msg.read
    }));
    
    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Send a new message
 */
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.user_id;
    const { conversationId, text } = req.body;
    
    if (!conversationId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Conversation ID and message text are required' });
    }
    
    // Extract the receiver ID from conversation ID
    const [userId1, userId2] = conversationId.split('_');
    const receiverId = senderId.toString() === userId1 ? userId2 : userId1;
    
    // Create the new message
    const newMessage = new MessageModel({
      senderId,
      receiverId,
      text: text.trim()
    });
    
    await newMessage.save();
    
    res.status(201).json({
      id: newMessage._id,
      senderId,
      text: newMessage.text,
      timestamp: newMessage.createdAt,
      read: newMessage.read,
      conversationId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
}; 