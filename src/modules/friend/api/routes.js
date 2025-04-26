"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const FriendController = require('../controllers/FriendController');
const checkLogin = require('../../../shared/middlewares/checkLogin');

// Friend Management Routes
router.get('/list', checkLogin, FriendController.getFriendsList);

// Send a friend request
router.post('/request', checkLogin, FriendController.sendFriendRequest);

// Get friend requests 
router.get('/requests', checkLogin, FriendController.getFriendRequests);

// // Get a specific user's friends
// router.get('/user/:userId', checkLogin, FriendController.getUserFriends);

// Accept friend request
router.put('/accept/:requestId', checkLogin, FriendController.acceptFriendRequest);

// Reject friend request
router.put('/reject/:requestId', checkLogin, FriendController.rejectFriendRequest);

// Cancel a sent friend request
router.delete('/cancel/:requestId', checkLogin, FriendController.cancelFriendRequest);

// Remove a friend
router.delete('/remove/:friendId', checkLogin, FriendController.removeFriend);

// // Check friendship status between two users
// router.post('/status', checkLogin, FriendController.checkFriendshipStatus);

module.exports = router; 