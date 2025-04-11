"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    FriendController,
    FriendRequestController
} = require('../controllers');
const  checkLogin  = require('../../../shared/middlewares/checkLogin');


// Friend Management Routes
router.get('/list', checkLogin, FriendController.getFriendsList);
router.get('/list/:userId', checkLogin, FriendController.getUserFriends);
router.get('/status/:targetUserId', checkLogin, FriendController.checkFriendship);
router.post('/remove', checkLogin, FriendController.removeFriend);

// Friend Request Routes
router.get('/requests', checkLogin, FriendRequestController.getPendingRequests);
router.post('/request', checkLogin, FriendRequestController.sendFriendRequest);
router.post('/accept', checkLogin, FriendRequestController.acceptFriendRequest);
router.post('/reject', checkLogin, FriendRequestController.rejectFriendRequest);
router.post('/cancel', checkLogin, FriendRequestController.cancelFriendRequest);

module.exports = router; 