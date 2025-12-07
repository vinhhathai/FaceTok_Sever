"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { PostController, CommentController, LikeController, ShareController } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");
const { mediaArray } = require("../../../shared/middlewares/uploadMediaMiddleware");
const { 
  uploadLimiter,
  createPostLimiter, 
  createCommentLimiter, 
  toggleLikeLimiter 
} = require("../../../shared/middlewares/rateLimiter");

// Post
router.post("/", checkLogin, createPostLimiter, uploadLimiter, mediaArray('media', 5), PostController.create); // createPost with media upload

// Get posts by author (for user profiles)
router.get("/author/:authorId", checkLogin, PostController.getByAuthor);

// Get timeline posts (for newsfeed)
router.get("/timeline", checkLogin, PostController.getTimeline);

// Post manage
router.get("/:id", checkLogin, PostController.getById);
router.put("/:id", checkLogin, uploadLimiter, mediaArray('media', 5), PostController.update);
router.delete("/:id", checkLogin, PostController.remove);

// Comments
router.post("/:postId/comment", checkLogin, createCommentLimiter, CommentController.create);
router.get("/:postId/comments", checkLogin, CommentController.listByPost);
router.get("/comment/:commentId/replies", checkLogin, CommentController.replies);
router.put("/comment/:commentId", checkLogin, CommentController.update);
router.delete("/comment/:commentId", checkLogin, CommentController.remove);

// Likes
router.post("/:postId/like/toggle", checkLogin, toggleLikeLimiter, LikeController.toggle);
router.post("/comment/:commentId/like/toggle", checkLogin, toggleLikeLimiter, LikeController.toggleCommentLike);

// Shares
router.post("/:postId/share/toggle", checkLogin, ShareController.toggle);

module.exports = router;
