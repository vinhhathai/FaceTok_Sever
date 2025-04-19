"use strict";
//----------------------------------------------------------------
const express = require("express");
const router = express.Router();
const { UserController, ProfileController } = require("../controllers");
const checkLogin = require("../../../shared/middlewares/checkLogin");

// Profile Routes
router.get("/profile/:id", checkLogin, ProfileController.getProfile);

// Other User Routes

module.exports = router; 