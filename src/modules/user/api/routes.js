"use strict";
//----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    ProfileController, 
    UserMediaController, 
    UserSearchController 
} = require('../controllers');
const  checkLogin  = require('../../../shared/middlewares/checkLogin');

// Profile routes
router.get('/profile/:id', checkLogin, ProfileController.getProfile);
router.put('/update-profile/:id', checkLogin, ProfileController.updateProfile);
router.put('/update-fullname', checkLogin, ProfileController.updateFullName);

// Media routes
router.put('/update-avatar-url', checkLogin, UserMediaController.updateAvatar);
router.put('/update-thumbnail-url', checkLogin, UserMediaController.updateThumbnail);

// Search routes
router.get('/search-people', checkLogin, UserSearchController.searchPeople);

module.exports = router; 