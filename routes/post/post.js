'use strict';
const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../middlewares/uploadFile');

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController');

/* POST CREATE POST */
router.post('/create', upload.single('file'), handleMulterError, CreatePostController.createNewPost);

module.exports = router;
