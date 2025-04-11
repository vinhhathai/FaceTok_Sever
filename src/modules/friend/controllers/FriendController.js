"use strict";
//----------------------------------------------------------------
const FriendService = require('../services/FriendService');

class FriendController {
    constructor() {
        this.friendService = FriendService;
    }
    
    getFriendsList = async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await this.friendService.getUserFriends(userId, page, limit);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/list',
                    error: result.error 
                }
        );
    }
    
    getUserFriends = async (req, res) => {
        const viewerId = req.user.id;
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await this.friendService.getUserFriendsWithPermissionCheck(userId, viewerId, page, limit);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/friend/list/${userId}`,
                    error: result.error 
                }
        );
    }
    
    checkFriendship = async (req, res) => {
        const userId = req.user.id;
        const targetUserId = req.params.targetUserId;
        
        const result = await this.friendService.checkFriendshipStatus(userId, targetUserId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: `/friend/status/${targetUserId}`,
                    error: result.error 
                }
        );
    }
    
    removeFriend = async (req, res) => {
        const userId = req.user.id;
        const { friendId } = req.body;
        
        if (!friendId) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/friend/remove',
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Friend ID is required'
                }
            });
        }
        
        const result = await this.friendService.removeFriend(userId, friendId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/remove',
                    error: result.error 
                }
        );
    }
}

module.exports = new FriendController(); 