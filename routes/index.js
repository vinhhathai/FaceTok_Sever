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


router.use('/user', checkLogin, userRouter);
router.use('/post', checkLogin, postRouter);
router.use('/auth', authRouter);



module.exports = router;
