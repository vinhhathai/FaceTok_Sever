'use strict';
const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../middlewares/uploadFile');

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController');

const GetPostController = require('../../controllers/ManagePostController/GetPostController');




/* GET USER POSTS */
router.get('/user/:userId', GetPostController.getUserPosts);


/* CREATE POST */
router.post('/create', upload.single('file'), handleMulterError, CreatePostController.createNewPost);



module.exports = router;
