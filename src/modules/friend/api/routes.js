"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { FriendController } = require('../controllers');
const checkLogin = require('../../../shared/middlewares/checkLogin');

/**
 * @route GET /api/friends/my-friends
 * @desc Get list of friends for the authenticated user
 * @access Private
 */
router.get('/my-friends', checkLogin, FriendController.getFriendsList);

/**
 * @route GET /api/friends/search
 * @desc Search friends by name, email, or bio
 * @access Private
 */
router.get('/search', checkLogin, FriendController.searchFriends);

/**
 * @route GET /api/friends/relationship/:targetUserId
 * @desc Check relationship status with another user
 * @access Private
 */
router.get('/relationship/:targetUserId', checkLogin, FriendController.checkRelationship);

/**
 * @route POST /api/friends/send-request
 * @desc Send a friend request to another user
 * @access Private
 */
router.post('/send-request', checkLogin, FriendController.sendFriendRequest);

/**
 * @route DELETE /api/friends/cancel-request
 * @desc Cancel a pending friend request
 * @access Private
 */
router.delete('/cancel-request', checkLogin, FriendController.cancelFriendRequest);

/**
 * @route POST /api/friends/accept-request
 * @desc Accept a pending friend request
 * @access Private
 */
router.post('/accept-request', checkLogin, FriendController.acceptFriendRequest);

/**
 * @route POST /api/friends/reject-request
 * @desc Reject a pending friend request
 * @access Private
 */
router.post('/reject-request', checkLogin, FriendController.rejectFriendRequest);

/**
 * @route GET /api/friends/pending-requests
 * @desc Get list of sent friend requests for the authenticated user
 * @access Private
 */
router.get('/pending-requests', checkLogin, FriendController.getSentFriendRequests);

/**
 * @route GET /api/friends/received-requests
 * @desc Get list of received friend requests for the authenticated user
 * @access Private
 */
router.get('/received-requests', checkLogin, FriendController.getReceivedFriendRequests);

/**
 * @route POST /api/friends/unfriend
 * @desc Remove a user from the friends list
 * @access Private
 */
router.post('/unfriend', checkLogin, FriendController.unfriend);

module.exports = router; 