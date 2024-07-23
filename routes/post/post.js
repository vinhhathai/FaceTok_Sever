'use strict';
//----------------------------------------------------------------
var express = require('express');
var router = express.Router();

// import controllers
const CreatePostController = require('../../controllers/ManagePostController/CreatePostController')




/* POST CREATE POST */
router.post('/create', CreatePostController.createNewPost);

module.exports = router;