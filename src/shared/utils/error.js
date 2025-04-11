'use strict';
//----------------------------------------------------------------

const errorCode = {
    // Auth Errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    LOGIN_FAILED: 'LOGIN_FAILED',
    REGISTER_FAILED: 'REGISTER_FAILED',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
    CHECK_AUTHORIZATION_FAILED: 'CHECK_AUTHORIZATION_FAILED',
    NOT_PERMISSIONS: 'NOT_PERMISSIONS',
    
    // Data Errors
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    POST_NOT_FOUND: 'POST_NOT_FOUND',
    COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
    FRIEND_NOT_FOUND: 'FRIEND_NOT_FOUND',
    
    // Operation Errors
    UPDATE_PROFILE_FAILED: 'UPDATE_PROFILE_FAILED',
    UPDATE_AVATAR_FAILED: 'UPDATE_AVATAR_FAILED',
    UPDATE_THUMBNAIL_FAILED: 'UPDATE_THUMBNAIL_FAILED',
    CREATE_POST_FAILED: 'CREATE_POST_FAILED',
    UPDATE_POST_FAILED: 'UPDATE_POST_FAILED',
    DELETE_POST_FAILED: 'DELETE_POST_FAILED',
    SEND_MESSAGE_FAILED: 'SEND_MESSAGE_FAILED',
    ADD_FRIEND_FAILED: 'ADD_FRIEND_FAILED',
    REMOVE_FRIEND_FAILED: 'REMOVE_FRIEND_FAILED',
    
    // General Errors
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    BAD_REQUEST: 'BAD_REQUEST',
    ERR_GET_DATA_FAILED: 'ERR_GET_DATA_FAILED',
    GET_PROFILE_FAILED: 'GET_PROFILE_FAILED'
};

const errorMessage = {
    // Auth Messages
    LOGIN_REQUIRED: 'You must be logged in to access this resource',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    NOT_PERMISSIONS: 'You do not have permission to access this resource',
    
    // Data Messages
    USER_NOT_FOUND: 'User not found',
    POST_NOT_FOUND: 'Post not found',
    COMMENT_NOT_FOUND: 'Comment not found',
    FRIEND_NOT_FOUND: 'Friend not found',
    ERR_INVALID_QUERY: 'Invalid search query',
    
    // Operation Messages
    UPDATE_PROFILE_FAILED: 'Failed to update user profile',
    UPDATE_AVATAR_FAILED: 'Failed to update user avatar',
    UPDATE_THUMBNAIL_FAILED: 'Failed to update user thumbnail',
    
    // Generic Messages
    INTERNAL_SERVER_ERROR: 'An internal server error occurred',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
    BAD_REQUEST: 'Bad request'
};

module.exports = {
    errorCode,
    errorMessage
}; 