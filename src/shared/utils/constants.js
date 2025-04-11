'use strict';
//----------------------------------------------------------------

// User Roles
const role = {
    MEMBER: 'member',
    ADMIN: 'admin',
    STAFF: 'staff'
};

// Gender Options
const gender = {
    MALE: 'male',
    FEMALE: 'female',
    UNDEFINED: 'undefined'
};

// Friend Request Status
const friendRequestStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

// Notification Types
const notificationType = {
    FRIEND_REQUEST: 'friend_request',
    FRIEND_ACCEPT: 'friend_accept',
    POST_LIKE: 'post_like',
    POST_COMMENT: 'post_comment',
    COMMENT_REPLY: 'comment_reply',
    SYSTEM: 'system'
};

module.exports = {
    role,
    gender,
    friendRequestStatus,
    notificationType
}; 