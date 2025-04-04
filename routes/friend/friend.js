"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const checkLogin = require('../../middlewares/checkLogin');
const FriendController = require('../../controllers/FriendController/FriendController');

// Get user's friends
router.get('/list', checkLogin, FriendController.getFriends);

// Get user's friends by userId
router.get('/list/:userId', FriendController.getUserFriends);

// Get pending friend requests
router.get('/requests', checkLogin, FriendController.getPendingRequests);

// Check friendship status with another user
router.get('/status/:targetUserId', checkLogin, FriendController.checkFriendshipStatus);

// Send a friend request
router.post('/request', checkLogin, FriendController.sendFriendRequest);

// Accept a friend request
router.post('/accept', checkLogin, FriendController.acceptFriendRequest);

// Reject a friend request
router.post('/reject', checkLogin, FriendController.rejectFriendRequest);

// Cancel a sent friend request
router.post('/cancel', checkLogin, FriendController.cancelFriendRequest);

// Remove a friend
router.post('/remove', checkLogin, FriendController.removeFriend);

module.exports = router; 