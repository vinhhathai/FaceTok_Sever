"use strict";
//----------------------------------------------------------------
const AuthLoginController = require('./AuthLoginController');
const AuthRegisterController = require('./AuthRegisterController');
const AuthPasswordController = require('./AuthPasswordController');

module.exports = {
    AuthLoginController:  new AuthLoginController(),
    AuthRegisterController:  new AuthRegisterController(),
    AuthPasswordController:  new AuthPasswordController()   
}; 