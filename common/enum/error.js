const errorCode = {
    VALIDATION_FAILED: "VALIDATION_FAILED",
    ERR_CREATE_ACCOUNT_FAIL: "ERR_CREATE_ACCOUNT_FAIL",
    DATA_CONFLICT: "DATA_CONFLICT"
};

const errorMessage = {
    EMAIL_EXISTED: "Email has existed already",
    USERNAME_EXISTED: "Username has existed already",
    UNKNOWN_ERROR: "Failure (unknown error)"
}

module.exports = { errorCode, errorMessage };
