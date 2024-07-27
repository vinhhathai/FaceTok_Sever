'use strict';
//----------------------------------------------------------------
// routes/index.js
const express = require('express');
const router = express.Router();

// import middlewares
const checkLogin = require('../middlewares/checkLogin')
// import routers
const postRouter = require('./post/post');
const authRouter = require('./auth/auth');
const userRouter = require('./user/user');


router.use('/post', checkLogin, postRouter);
router.use('/auth', authRouter);
router.use('/user', userRouter);



module.exports = router;
