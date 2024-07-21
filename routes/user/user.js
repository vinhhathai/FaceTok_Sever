var express = require('express');
var router = express.Router();
const UserController = require('../../controllers/UserController')

// import middlewares
const checkLogin = require('../../middlewares/checkLogin')

/* GET SEARCHING USER */
router.get('/search-user', checkLogin, UserController.searchUser);



module.exports = router;

