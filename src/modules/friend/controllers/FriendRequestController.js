"use strict";
//----------------------------------------------------------------
const { FriendRequestService } = require('../services');

class FriendRequestController {
    constructor() {
        this.friendRequestService = FriendRequestService;
    }

    sendFriendRequest = async (req, res) => {
        const senderId = req.user.id;
        const { recipientId } = req.body;
        
        if (!recipientId) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/friend/request',
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Recipient ID is required'
                }
            });
        }
        
        const result = await this.friendRequestService.sendFriendRequest(senderId, recipientId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/request',
                    error: result.error 
                }
        );
    }
    
    acceptFriendRequest = async (req, res) => {
        const recipientId = req.user.id;
        const { requestId } = req.body;
        
        if (!requestId) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/friend/accept',
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Request ID is required'
                }
            });
        }
        
        const result = await this.friendRequestService.acceptFriendRequest(requestId, recipientId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/accept',
                    error: result.error 
                }
        );
    }
    
    rejectFriendRequest = async (req, res) => {
        const recipientId = req.user.id;
        const { requestId } = req.body;
        
        if (!requestId) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/friend/reject',
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Request ID is required'
                }
            });
        }
        
        const result = await this.friendRequestService.rejectFriendRequest(requestId, recipientId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/reject',
                    error: result.error 
                }
        );
    }
    
    cancelFriendRequest = async (req, res) => {
        const senderId = req.user.id;
        const { requestId } = req.body;
        
        if (!requestId) {
            return res.status(400).json({
                timestamp: new Date().toISOString(),
                path: '/friend/cancel',
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Request ID is required'
                }
            });
        }
        
        const result = await this.friendRequestService.cancelFriendRequest(requestId, senderId);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/cancel',
                    error: result.error 
                }
        );
    }
    
    getPendingRequests = async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await this.friendRequestService.getPendingFriendRequests(userId, page, limit);
        
        return res.status(result.statusCode).json(
            result.success 
                ? { data: result.data } 
                : { 
                    timestamp: new Date().toISOString(),
                    path: '/friend/requests',
                    error: result.error 
                }
        );
    }
}

module.exports = new FriendRequestController(); 