'use strict';
//----------------------------------------------------------------
// routes/index.js
const express = require('express');
const router = express.Router();

const postRouter = require('./post/post');
const authRouter = require('./auth/auth');

router.use('/auth', authRouter);
router.use('/post', postRouter);

module.exports = router;
