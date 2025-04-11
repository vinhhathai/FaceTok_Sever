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
const { checkLogin } = require('../../../middlewares/auth');

// Feed Routes
router.get('/', checkLogin, FeedController.getTimelinePosts);
router.get('/user/:userId', checkLogin, FeedController.getUserPosts);

// Post Management Routes
router.post('/create', checkLogin, PostManagementController.createPost);
router.put('/update/:postId', checkLogin, PostManagementController.updatePost);
router.delete('/delete/:postId', checkLogin, PostManagementController.deletePost);
router.get('/:id', checkLogin, PostManagementController.getPostById);

// Post Interaction Routes
router.post('/like/:postId', checkLogin, PostInteractionController.toggleLike);
router.get('/like/:postId/status', checkLogin, PostInteractionController.checkLikeStatus);
router.post('/:id/like', checkLogin, PostInteractionController.likePost);
router.post('/:id/unlike', checkLogin, PostInteractionController.unlikePost);

// Comment Routes
router.post('/comment/:postId', checkLogin, CommentController.createComment);
router.get('/comment/:postId', checkLogin, CommentController.getComments);
router.delete('/comment/:commentId', checkLogin, CommentController.deleteComment);

module.exports = router; 