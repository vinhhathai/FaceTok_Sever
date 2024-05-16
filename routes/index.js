var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController')
const SignUpController = require('../controllers/SignUpController')
const LoginController = require('../controllers/LoginController')
const ResetPasswordController = require('../controllers/ResetPasswordController')
// import middlewares
const checkLogin = require('../middlewares/checkLogin')
//-----------------------------------------------------------------------//

// Reset password

router.post('/reset-password', ResetPasswordController.resetPassword)

/* POST LOGIN */
router.post('/login', LoginController.loginToSystem);

/* POST SIGN UP */
router.post('/sign-up', SignUpController.signUp);

/* GET SEARCHING USER */
router.get('/search-user', checkLogin, UserController.searchUser);

/* GET home page. */
router.get('/', checkLogin, UserController.getHome);

module.exports = router;
