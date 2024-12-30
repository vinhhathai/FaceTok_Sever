"use strict";
//----------------------------------------------------------------
var express = require("express");
var router = express.Router();
const SearchUserController = require("../../controllers/SearchUserController/SearchUserController");
const RemoveFriendController = require("../../controllers/ManageFriendController/RemoveFriendController");
const AddFriendController = require("../../controllers/ManageFriendController/AddFriendController");
const GetListOfFriendController = require("../../controllers/ManageFriendController/GetListOfFriendController");
const ViewProfileController = require("../../controllers/ViewProfileController/ViewProfileController");
const UpdateAvatarController = require("../../controllers/UpdateAvatarController/UpdateAvatarController")
const UpdateThumbnailController = require("../../controllers/UpdateThumbnailController/UpdateThumbnailController")
const UpdateProfileController = require("../../controllers/UpdateProfileController/UpdateProfileController");


const checkLogin = require("../../middlewares/checkLogin");
const { upload, handleMulterError } = require('../../middlewares/uploadFile');


/* UPDATE PROFILE */
router.put("/update-profile/:id", checkLogin, UpdateProfileController.updateProfile);
/* GET PROFILE */
router.get("/profile/:id", checkLogin, ViewProfileController.getProfile);
/* UPDATE AVATAR */
router.put("/update-avatar/:id", checkLogin, upload.single('avatar'), handleMulterError, UpdateAvatarController.updateAvatar );
/* UPDATE THUMBNAIL */
router.put("/update-thumbnail/:id", checkLogin, upload.single('thumbnail'), handleMulterError, UpdateThumbnailController.updateThumbnail);


// /* GET LIST OF FRIENDS */
// router.get("/friends", GetListOfFriendController.getFriends);

// /* DELETE UNFRIEND */
// router.delete("/remove-friend", RemoveFriendController.removeFriend);

// /* POST ADD FRIEND */
// router.post("/add-friend", AddFriendController.addFriend);

// /* GET SEARCHING USER */
// router.get("/search-people", SearchUserController.searchUser);

module.exports = router;
