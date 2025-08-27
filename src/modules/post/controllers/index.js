"use strict";
//----------------------------------------------------------------
const PostController = require('./PostController');
const CommentController = require('./CommentController');
const LikeController = require('./LikeController');
const ShareController = require('./ShareController');

module.exports = {
	PostController: new PostController(),
	CommentController: new CommentController(),
	LikeController: new LikeController(),
	ShareController: new ShareController()
};