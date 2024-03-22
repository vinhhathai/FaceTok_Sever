var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController')

/* GET SEARCHING USER */
router.get('/search-user', UserController.searchUser );

/* GET home page. */
router.get('/', UserController.getAllUsers );

module.exports = router;
