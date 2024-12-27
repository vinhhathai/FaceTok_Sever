'use strict';
//----------------------------------------------------------------
var express = require('express');
var router = express.Router();
var UserController = require('../../controllers/UserController')

// import middlewares
const checkLogin = require('../../middlewares/checkLogin')

/* GET home page. */
router.get('/', checkLogin, UserController.getHome);

module.exports = router;