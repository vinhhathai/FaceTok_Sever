'use strict';
const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../middlewares/uploadFile');

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController');
const DeletePostController = require('../../controllers/ManagePostController/DeletePostController');

/* DELETE POST */
router.delete('/delete/:id', DeletePostController.softDeletePost);

/* CREATE POST */
router.post('/create', upload.single('file'), handleMulterError, CreatePostController.createNewPost);

module.exports = router;
