"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { searchUsers } = require('../../controllers/SearchController/SearchController');

// Route to search for users
router.get('/users', searchUsers);

module.exports = router; 