"use strict";
//----------------------------------------------------------------
const MessageModel = require('../models/MessageModel');
const RoomModel = require('../models/RoomModel');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const UserModel = require('../../../modules/user/models/UserModel');

class MessageRepository {
    constructor() {
        this.messageModel = MessageModel;
        this.roomModel = RoomModel;
        this.userModel = UserModel;
    }

    /**
     * Get recent chat rooms for a user
     * @param {String} userId - User ID
     * @param {Number} limit - Maximum number of rooms to return
     * @returns {Object} Query result
     */
    async getRooms(userId, limit = 10) {
        try {
            // Find all rooms where the user is a member
            const rooms = await this.roomModel
                .find({ members: new ObjectId(userId) })
                .sort({ updatedAt: -1 })
                .limit(limit)
                .populate('messages')
                .populate({
                    path: 'members',
                    select: ' fullName avatar'
                });

            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            console.error('Error getting rooms:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // /**
    //  * Get a chat room between two users
    //  * @param {String} userId1 - First user ID
    //  * @param {String} userId2 - Second user ID
    //  * @returns {Object} Query result
    //  */
    async getRoomByMembers(userId1, userId2) {
        try {
            // Find a room with both users as members
            const room = await this.roomModel.findOne({
                members: { 
                    $all: [new ObjectId(userId1), new ObjectId(userId2)],
                    $size: 2 // Ensure it's a direct chat (only 2 members)
                },
                isGroup: false // Not a group chat
            });

            return {
                success: true,
                data: room
            };
        } catch (error) {
            console.error('Error finding room by members:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // /**
    //  * Count unread messages for a user
    //  * @param {String} userId - User ID
    //  * @returns {Object} Query result
    //  */
    // async countUnreadMessages(userId) {
    //     try {
    //         // Find all rooms for the user
    //         const rooms = await this.roomModel
    //             .find({ members: ObjectId(userId) });
                
    //         // Calculate total unread messages from all rooms
    //         let totalUnreadCount = 0;
    //         rooms.forEach(room => {
    //             const unreadCount = room.unreadCount.get(userId.toString()) || 0;
    //             totalUnreadCount += unreadCount;
    //         });

    //         return {
    //             success: true,
    //             data: { count: totalUnreadCount }
    //         };
    //     } catch (error) {
    //         console.error('Error counting unread messages:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }
    
    // /**
    //  * Create or get a room between two users
    //  * @param {String} userId1 - First user ID
    //  * @param {String} userId2 - Second user ID
    //  * @returns {Object} Query result with the room
    //  */
    // async createOrGetRoom(userId1, userId2) {
    //     try {
    //         // First check if room already exists
    //         let room = await this.getRoomByMembers(userId1, userId2);
            
    //         if (room.success && room.data) {
    //             return room;
    //         }
            
    //         // Create new room if it doesn't exist
    //         const newRoom = new this.roomModel({
    //             members: [ObjectId(userId1), ObjectId(userId2)],
    //             isGroup: false,
    //             unreadCount: new Map([[userId2.toString(), 0]])
    //         });
            
    //         await newRoom.save();
            
    //         return {
    //             success: true,
    //             data: newRoom
    //         };
    //     } catch (error) {
    //         console.error('Error creating or getting room:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }
    
    /**
     * Get messages for a specific room
     * @param {String} roomId - Room ID
     * @param {Number} page - Page number
     * @param {Number} limit - Number of messages per page
     * @returns {Object} Query result with messages
     */
    async getMessages(roomId, ) {
        try {
            // Check if roomId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return {
                    success: false,
                    error: 'Invalid room ID format'
                };
            }
            
            const messages = await this.messageModel
                .find({ roomId: new ObjectId(roomId) })
                .sort({ createdAt: -1 }) // Newest first
                .populate({
                    path: 'senderId',
                    select: 'fullName avatar'
                });
                
    
            
            return {
                success: true,
                data: {
                    messages: messages.reverse(), // Return in chronological order
                }
            };
        } catch (error) {
            console.error('Error getting messages:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Mark messages as read in a room for a user
     * @param {String} roomId - Room ID
     * @param {String} userId - User ID who read the messages
     * @returns {Object} Query result
     */
    async markMessagesAsRead(roomId, userId) {
        try {
            // Update unread count for user to 0
            await this.roomModel.updateOne(
                { _id: new ObjectId(roomId) },
                { $set: { [`unreadCount.${userId}`]: 0 } }
            );

            return {
                success: true,
                data: { unreadCount: 0 }
            };
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get a room by ID
     * @param {String} roomId - Room ID
     * @returns {Object} Query result with room data
     */
    async getRoomById(roomId) {
        try {
            // Check if roomId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return {
                    success: false,
                    error: 'Invalid room ID format'
                };
            }
            
            const room = await this.roomModel
                .findById(new ObjectId(roomId))
                .populate('members', 'fullName avatar')
                .populate('messages');
                
            return {
                success: true,
                data: room
            };
        } catch (error) {
            console.error('Error getting room by ID:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // /**
    //  * Check if a user exists by ID
    //  * @param {String} userId - User ID to check
    //  * @returns {Object} Query result indicating whether the user exists
    //  */
    async checkUserExists(userId) {
        try {
            // Check if userId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    error: 'Invalid user ID format'
                };
            }
            
            // Check if user exists
            const user = await this.userModel.exists({ _id: new ObjectId(userId) });
            
            return {
                success: true,
                data: !!user // Convert to boolean
            };
        } catch (error) {
            console.error('Error checking user existence:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a new chat room
     * @param {Array} members - Array of user IDs who are members
     * @param {Boolean} isGroup - Whether it's a group chat
     * @param {String} groupName - Group name (for group chats)
     * @param {String} groupAvatar - Group avatar URL (for group chats)
     * @returns {Object} Query result with the created chat room
     */
    async createRoom(members, isGroup = false, groupName = null, groupAvatar = null) {
        try {
            // Create initial unreadCount map with 0 for each member
            const unreadCount = new Map();
            members.forEach(memberId => {
                unreadCount.set(memberId.toString(), 0);
            });
            
            // Create new room
            const newRoom = new this.roomModel({
                members: members.map(id => new ObjectId(id)),
                isGroup,
                groupName,
                groupAvatar,
                unreadCount
            });
            
            await newRoom.save();
            
            // Get detailed member information
            const populatedRoom = await this.roomModel
                .findById(newRoom._id)
                .populate('members', 'fullName profilePicture thumbnail isOnline lastActive');
                
            return {
                success: true,
                data: populatedRoom
            };
        } catch (error) {
            console.error('Error creating chat room:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send a message from one user to another
     * @param {String} senderId - Sender user ID
     * @param {String} receiverId - Receiver user ID
     * @param {String} content - Message content
     * @returns {Object} Query result with the sent message
     */
    async sendMessage(senderId, receiverId, content) {
        try {
            // Get or create the room
            let roomResult = await this.getRoomByMembers(senderId, receiverId);
            
            let room;
            // If room doesn't exist, create a new one
            if (!roomResult.success || !roomResult.data) {
                const createRoomResult = await this.createRoom(
                    [senderId, receiverId],
                    false, // isGroup = false
                    null,  // groupName = null
                    null   // groupAvatar = null
                );
                
                if (!createRoomResult.success) {
                    throw new Error(createRoomResult.error);
                }
                
                room = createRoomResult.data;
            } else {
                room = roomResult.data;
            }
            
            // Create the message
            const message = new this.messageModel({
                senderId: new ObjectId(senderId),
                content: content,
                roomId: room._id
            });
            
            // Save message không sử dụng session
            await message.save();
            
            // Update room with message and update unread count
            const unreadCount = room.unreadCount || new Map();
            const currentCount = unreadCount.get(receiverId.toString()) || 0;
            unreadCount.set(receiverId.toString(), currentCount + 1);
            
            await this.roomModel.updateOne(
                { _id: room._id },
                { 
                    $push: { messages: message._id },
                    $set: { 
                        unreadCount: unreadCount,
                        updatedAt: new Date()
                    }
                }
            );
            
            // Return message with populated sender
            const populatedMessage = await this.messageModel.findById(message._id)
                .populate({
                    path: 'senderId',
                    select: 'fullName avatar'
                });
            
            // Get updated room info
            const updatedRoom = await this.roomModel.findById(room._id)
                .populate('members', 'fullName avatar')
                .populate('messages');
            
            return {
                success: true,
                data: {
                    message: populatedMessage,
                    room: updatedRoom
                }
            };
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = MessageRepository; 