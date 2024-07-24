'use strict';
const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../middlewares/uploadFile');

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController');
const DeletePostController = require('../../controllers/ManagePostController/DeletePostController');
const UpdatePostController = require('../../controllers/ManagePostController/UpdatePostController');

/* UPDATE POST */
router.put('/update',upload.single('file'), handleMulterError, UpdatePostController.updatePost);

/* DELETE POST */
router.delete('/delete/:id', DeletePostController.softDeletePost);

/* CREATE POST */
router.post('/create', upload.single('file'), handleMulterError, CreatePostController.createNewPost);

module.exports = router;
