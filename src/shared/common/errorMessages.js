'use strict';

/**
 * Error message definitions corresponding to error codes
 */
const AUTH_MESSAGES = {
    UNAUTHORIZED: 'You need to log in to access this resource',
    LOGIN_FAILED: 'Login failed, please try again',
    REGISTER_FAILED: 'Registration failed, please try again',
    EMAIL_ALREADY_EXISTS: 'Email already exists in the system',
    INVALID_CREDENTIALS: 'Email or password is incorrect',
    PASSWORD_RESET_FAILED: 'Password reset failed',
    REQUEST_PASSWORD_RESET_FAILED: 'Password reset request failed',
    RESET_PASSWORD_FAILED: 'Password reset failed',
    CHECK_AUTHORIZATION_FAILED: 'Authorization check failed',
    NOT_PERMISSIONS: 'You do not have permission to access this resource',
    ACCOUNT_IS_BANNED: 'Your account has been banned',
    TOKEN_EXPIRED: 'Your session has expired, please log in again',
    REFRESH_TOKEN_FAILED: 'Token refresh failed',
    LOGOUT_FAILED: 'Logout failed',
    CHANGE_PASSWORD_FAILED: 'Password change failed',
    CREATE_ACCOUNT_FAILED: 'Account creation failed',
    VERIFY_OTP_FAILED: 'OTP verification failed',
};

const VALIDATION_MESSAGES = {
    VALIDATION_FAILED: 'Invalid data',
    INVALID_INPUT: 'Invalid input data',
    MISSING_FIELDS: 'Required information is missing',
    INVALID_EMAIL: 'Invalid email',
    INVALID_PASSWORD: 'Invalid password',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
};

const DATA_MESSAGES = {
    DATA_NOT_FOUND: 'Data not found',
    USER_NOT_FOUND: 'User not found',
    POST_NOT_FOUND: 'Post not found',
    COMMENT_NOT_FOUND: 'Comment not found',
    FRIEND_NOT_FOUND: 'Friend not found',
    MESSAGE_NOT_FOUND: 'Message not found',
    DATA_CONFLICT: 'Data conflict',
};

const USER_MESSAGES = {
    UPDATE_PROFILE_FAILED: 'Profile update failed',
    UPDATE_AVATAR_FAILED: 'Avatar update failed',
    UPDATE_THUMBNAIL_FAILED: 'Cover image update failed',
    GET_PROFILE_FAILED: 'Failed to retrieve profile information',
    SEARCH_USER_FAILED: 'User search failed',
    SEARCH_USERS_FAILED: 'Users search failed',
};

const POST_MESSAGES = {
    CREATE_POST_FAILED: 'Post creation failed',
    UPDATE_POST_FAILED: 'Post update failed',
    DELETE_POST_FAILED: 'Post deletion failed',
    LIKE_POST_FAILED: 'Post like failed',
    COMMENT_POST_FAILED: 'Post comment failed',
};

const FRIEND_MESSAGES = {
    ADD_FRIEND_FAILED: 'Friend addition failed',
    REMOVE_FRIEND_FAILED: 'Friend removal failed',
    SEND_FRIEND_REQUEST_FAILED: 'Friend request sending failed',
    ACCEPT_FRIEND_REQUEST_FAILED: 'Friend request acceptance failed',
    REJECT_FRIEND_REQUEST_FAILED: 'Friend request rejection failed',
    GET_FRIENDS_LIST_FAILED: 'Failed to retrieve friends list',
    FRIEND_REQUEST_FAILED: 'Friend request failed',
    GET_FRIEND_REQUESTS_FAILED: 'Failed to retrieve friend requests',
};

const MESSAGE_MESSAGES = {
    SEND_MESSAGE_FAILED: 'Message sending failed',
    GET_MESSAGES_FAILED: 'Failed to retrieve messages',
    GET_CONVERSATIONS_FAILED: 'Failed to retrieve conversations',
};

const SERVER_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Internal server error occurred',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    DATABASE_ERROR: 'Database error',
    ERR_INTERNAL_SERVER: 'Internal server error occurred',
};

const REQUEST_MESSAGES = {
    BAD_REQUEST: 'Invalid request',
    ERR_GET_DATA_FAILED: 'Failed to retrieve data',
    ROUTE_NOT_FOUND: 'Route not found',
};

// Combine all error messages into one object
const errorMessage = {
    ...AUTH_MESSAGES,
    ...VALIDATION_MESSAGES,
    ...DATA_MESSAGES,
    ...USER_MESSAGES,
    ...POST_MESSAGES,
    ...FRIEND_MESSAGES,
    ...MESSAGE_MESSAGES,
    ...SERVER_MESSAGES,
    ...REQUEST_MESSAGES,
};

module.exports = {
    // Error messages by category
    AUTH_MESSAGES,
    VALIDATION_MESSAGES,
    DATA_MESSAGES,
    USER_MESSAGES,
    POST_MESSAGES,
    FRIEND_MESSAGES,
    MESSAGE_MESSAGES,
    SERVER_MESSAGES,
    REQUEST_MESSAGES,
    
    // Combined collection for backward compatibility
    errorMessage
}; 