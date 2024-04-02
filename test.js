const { singUp } = require('./controllers/SignUpController');
const userValidation = require('./validation/userValidation')

function test() {
    // console.log(userValidation.validate({
    //     username: "v1",
    //     password: "123456",
    //     confirmPassword: "123456",
    //     email: "hamster@gmail.com",
    //     birthday: "12-24-2015",
    // }))
    console.log(singUp())
}
test();