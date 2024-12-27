'use strict';
const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../middlewares/uploadFile');

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController');
const DeletePostController = require('../../controllers/ManagePostController/DeletePostController');
const UpdatePostController = require('../../controllers/ManagePostController/UpdatePostController');
const GetPostHomeController = require('../../controllers/ManagePostController/GetPostHomeController');
const GetPostProfileController = require('../../controllers/ManagePostController/GetPostProfileController');


/* GET POST AT PROFILE PAGE */
router.get('/profile', GetPostProfileController.getPost);

/* GET POST AT HOME PAGE */
router.get('/home', GetPostHomeController.getPost);

/* CREATE POST */
router.post('/create', upload.single('file'), handleMulterError, CreatePostController.createNewPost);

/* UPDATE POST */
router.put('/update', upload.single('file'), handleMulterError, UpdatePostController.updatePost);

/* DELETE POST */
router.delete('/delete/:id', DeletePostController.softDeletePost);



module.exports = router;
