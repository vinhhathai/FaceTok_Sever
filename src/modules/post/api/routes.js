"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { PostController /*, CommentController, LikeController, ShareController */ } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");
const { mediaArray } = require("../../../shared/middlewares/uploadMediaMiddleware");

// Post
router.post("/", checkLogin, mediaArray('media', 5), PostController.create); // createPost with media upload

// Get posts by author (for user profiles)
router.get("/author/:authorId", checkLogin, PostController.getByAuthor);

// Get timeline posts (for newsfeed)
router.get("/timeline", checkLogin, PostController.getTimeline);

// Post manage
// router.get("/:id", checkLogin, PostController.getById);
router.put("/:id", checkLogin, mediaArray('media', 5), PostController.update);
router.delete("/:id", checkLogin, PostController.remove);

// // Comments
// router.post("/:postId/comment", checkLogin, CommentController.create);
// router.get("/:postId/comments", checkLogin, CommentController.listByPost);
// router.get("/comment/:commentId/replies", checkLogin, CommentController.replies);

// // Likes
// router.post("/:postId/like/toggle", checkLogin, LikeController.toggle);

// // Shares
// router.post("/:postId/share/toggle", checkLogin, ShareController.toggle);

module.exports = router;
