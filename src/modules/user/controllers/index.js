"use strict";
//----------------------------------------------------------------
const ProfileController = require('./ProfileController');
const AvatarController = require('./AvatarController');
const ThumbnailController = require('./ThumbnailController');
const FullnameController = require('./FullnameController');
const UserSearchController = require('./UserSearchController');
const MediaController = require('./MediaController');
const AdminController = require('./AdminController');

module.exports = {
    ProfileController: new ProfileController(),
    AvatarController: new AvatarController(),
    ThumbnailController: new ThumbnailController(),
    FullnameController: new FullnameController(),
    UserSearchController: new UserSearchController(),
    MediaController: new MediaController(),
    AdminController: new AdminController()
};