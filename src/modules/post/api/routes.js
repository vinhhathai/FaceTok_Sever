"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const {
    FeedController,
    PostManagementController,
    PostInteractionController,
    CommentController
} = require('../controllers');
const  checkLogin  = require('../../../shared/middlewares/checkLogin');


// Feed Routes
router.get('/', checkLogin, FeedController.getTimelinePosts);
router.post('/user', checkLogin, FeedController.getUserPosts);

// Post Management Routes
router.post('/create', checkLogin, PostManagementController.createPost);
router.put('/update', checkLogin, PostManagementController.updatePost);
router.delete('/delete', checkLogin, PostManagementController.deletePost);
router.post('/get-by-id', checkLogin, PostManagementController.getPostById);

// Post Interaction Routes
router.post('/like', checkLogin, PostInteractionController.toggleLike);
router.post('/like-status', checkLogin, PostInteractionController.checkLikeStatus);
router.post('/like-post', checkLogin, PostInteractionController.likePost);
router.post('/unlike-post', checkLogin, PostInteractionController.unlikePost);

// Comment Routes
router.post('/comment', checkLogin, CommentController.createComment);
router.post('/get-comments', checkLogin, CommentController.getComments);
router.delete('/comment', checkLogin, CommentController.deleteComment);

module.exports = router; 