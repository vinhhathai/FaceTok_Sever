'use strict';
const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../middlewares/uploadFile');

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController');
const GetPostController = require('../../controllers/ManagePostController/GetPostController');
const DeletePostController = require('../../controllers/ManagePostController/DeletePostController');
const UpdatePostController = require('../../controllers/ManagePostController/UpdatePostController');
const LikePostController = require('../../controllers/ManagePostController/LikePostController');
const CommentController = require('../../controllers/CommentController/CommentController');

// Import middlewares
const checkLogin = require('../../middlewares/checkLogin');

/* GET USER POSTS */
router.get('/user/:userId', GetPostController.getUserPosts);

/* GET TIMELINE POSTS */
router.get('/', checkLogin, GetPostController.getTimelinePosts);

/* CREATE POST */
router.post('/create', checkLogin, upload.single('file'), handleMulterError, CreatePostController.createNewPost);

/* DELETE POST */
router.delete('/delete/:postId', checkLogin, DeletePostController.deletePost);

/* UPDATE POST */
router.put('/update/:postId', checkLogin, UpdatePostController.updatePost);

/* LIKE/UNLIKE POST */
router.post('/like/:postId', checkLogin, LikePostController.toggleLike);

/* CHECK LIKE STATUS */
router.get('/like/:postId/status', checkLogin, LikePostController.checkLikeStatus);

/* COMMENT ROUTES */
router.post('/comment/:postId', checkLogin, CommentController.addComment);
router.get('/comment/:postId', checkLogin, CommentController.getComments);
router.delete('/comment/:commentId', checkLogin, CommentController.deleteComment);

module.exports = router;
