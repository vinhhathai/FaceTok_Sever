'use strict';
//----------------------------------------------------------------
var express = require('express');
var router = express.Router();
const SearchUserController = require('../../controllers/SearchUserController/SearchUserController')



/* GET SEARCHING USER */
router.get('/search-people', SearchUserController.searchUser);



module.exports = router;

