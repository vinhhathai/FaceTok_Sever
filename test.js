// const { singUp } = require('./controllers/SignUpController');
// const loginValidation = require('./validation/loginValidation');
// const userValidation = require('./validation/userValidation')
// const {login, loginToSystem} = require('./controllers/LoginController');
// const UserModel = require('./models/UserModel');
require('dotenv').config()


// function test() {
//     // console.log(userValidation.validate({
//     //     username: "v1",
//     //     password: "123456",
//     //     confirmPassword: "123456",
//     //     email: "hamster@gmail.com",
//     //     birthday: "12-24-2015",
//     // }))
//     // console.log(signUp())

//     // console.log(loginValidation.validate(
//     //     {
//     //         username: "vinh2k3",
//     //         password: "1321231",
//     //     }
//     // ))

// // console.log(loginToSystem())
// const username = "test"

// UserModel.findOne({username: "test"})
// .then((res) => {
//     console.log(res)
// })
// .catch((err) => {
//     console.log(err)
// })


// }
// test();

function testDotenv() {
    console.log(process.env.PORT)
    
}
testDotenv()

