'use strict';
//----------------------------------------------------------------
// routes/index.js
const express = require('express');
const router = express.Router();

const postRouter = require('./post/post');
const authRouter = require('./auth/auth');
const checkLogin = require('../middlewares/checkLogin')

router.use('/post', checkLogin, postRouter);
router.use('/auth', authRouter);

module.exports = router;
