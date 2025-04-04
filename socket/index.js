"use strict";
//----------------------------------------------------------------
const socketIO = require('socket.io');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');
const FriendRequestModel = require('../models/FriendRequestModel');
const jwt = require('jsonwebtoken');

// Store online users: { userId: socketId }
const onlineUsers = new Map();

function setupSocketIO(server) {
  const io = socketIO(server, {
    cors: {
      origin: "*", // In production, restrict this to your client's URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware to authenticate users
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token is missing'));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      const user = await UserModel.findById(decoded._id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.user = {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.profilePicture
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Add user to online users map
    onlineUsers.set(socket.user._id.toString(), socket.id);
    
    // Emit online users to all connected clients
    io.emit('userStatus', Array.from(onlineUsers.keys()));

    // Handle private message
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, text } = data;
        const senderId = socket.user._id;

        if (!receiverId || !text.trim()) {
          return socket.emit('error', { message: 'Invalid message data' });
        }

        // Save message to database
        const newMessage = new MessageModel({
          senderId,
          receiverId,
          text: text.trim()
        });

        await newMessage.save();

        // Create formatted message for client
        const messageData = {
          id: newMessage._id,
          senderId: newMessage.senderId,
          receiverId: newMessage.receiverId,
          text: newMessage.text,
          timestamp: newMessage.createdAt,
          read: newMessage.read
        };

        // Get the conversation ID
        const conversationId = MessageModel.getConversationId(senderId, receiverId);
        
        // Send to sender
        socket.emit('newMessage', { ...messageData, conversationId });
        
        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', { ...messageData, conversationId });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          senderId: socket.user._id,
          typing: data.typing
        });
      }
    });

    // Handle read receipts
    socket.on('messageRead', async (data) => {
      try {
        const { messageId } = data;
        
        // Update message in database
        await MessageModel.findByIdAndUpdate(messageId, { read: true });
        
        // Notify sender that message was read
        const message = await MessageModel.findById(messageId);
        if (message) {
          const senderSocketId = onlineUsers.get(message.senderId.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageReadUpdate', { messageId });
          }
        }
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    });

    // Handle friend request events
    socket.on('addFriend', async (data) => {
      try {
        const { recipientId } = data;
        const senderId = socket.user._id;

        if (!recipientId) {
          return socket.emit('error', { message: 'Invalid recipient ID' });
        }

        // Create friend request
        const newRequest = new FriendRequestModel({
          sender: senderId,
          recipient: recipientId,
          status: 'pending'
        });

        await newRequest.save();
        
        // Populate sender info for the recipient
        const populatedRequest = await FriendRequestModel.findById(newRequest._id)
          .populate('sender', 'username profilePicture')
          .exec();

        // Notify recipient if online
        const recipientSocketId = onlineUsers.get(recipientId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('friendRequestReceived', populatedRequest);
        }
      } catch (error) {
        console.error('Error sending friend request:', error);
        socket.emit('error', { message: 'Failed to send friend request' });
      }
    });

    // Handle friend request acceptance
    socket.on('acceptFriendRequest', async (data) => {
      try {
        const { requestId } = data;
        const userId = socket.user._id;

        // Find and update the request
        const request = await FriendRequestModel.findById(requestId);
        if (!request || request.recipient.toString() !== userId.toString()) {
          return socket.emit('error', { message: 'Invalid friend request' });
        }

        request.status = 'accepted';
        await request.save();

        // Update both users' friends lists
        const sender = await UserModel.findById(request.sender);
        const recipient = await UserModel.findById(request.recipient);

        if (!sender.friends.includes(recipient._id)) {
          sender.friends.push(recipient._id);
          await sender.save();
        }

        if (!recipient.friends.includes(sender._id)) {
          recipient.friends.push(sender._id);
          await recipient.save();
        }

        // Notify the request sender if online
        const senderSocketId = onlineUsers.get(request.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('friendRequestAccepted', {
            _id: recipient._id,
            username: recipient.username,
            avatar: recipient.profilePicture
          });
        }
      } catch (error) {
        console.error('Error accepting friend request:', error);
        socket.emit('error', { message: 'Failed to accept friend request' });
      }
    });

    // Handle friend removal
    socket.on('removeFriend', async (data) => {
      try {
        const { friendId } = data;
        const userId = socket.user._id;

        if (!friendId) {
          return socket.emit('error', { message: 'Invalid friend ID' });
        }

        // Remove friend from both users' friends lists
        await UserModel.findByIdAndUpdate(userId, {
          $pull: { friends: friendId }
        });

        await UserModel.findByIdAndUpdate(friendId, {
          $pull: { friends: userId }
        });

        // Delete any accepted friend request between the users
        await FriendRequestModel.deleteOne({
          status: 'accepted',
          $or: [
            { sender: userId, recipient: friendId },
            { sender: friendId, recipient: userId }
          ]
        });

        // Notify the removed friend if online
        const friendSocketId = onlineUsers.get(friendId.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit('friendRemoved', { userId });
        }
      } catch (error) {
        console.error('Error removing friend:', error);
        socket.emit('error', { message: 'Failed to remove friend' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      
      // Remove user from online users
      onlineUsers.delete(socket.user._id.toString());
      
      // Broadcast updated online users
      io.emit('userStatus', Array.from(onlineUsers.keys()));
    });
  });

  return io;
}

module.exports = setupSocketIO; 