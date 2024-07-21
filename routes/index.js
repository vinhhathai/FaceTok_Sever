// routes/index.js
const express = require('express');
const router = express.Router();

const usersRouter = require('./user/user');
const authRouter = require('./auth/auth');
const homeRouter = require('./home/home')

router.use('/auth', authRouter);
router.use('/home', homeRouter);
router.use('/user', usersRouter);

module.exports = router;
