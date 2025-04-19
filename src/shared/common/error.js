'use strict';
//----------------------------------------------------------------

const errorCode = {
    // Auth Errors (AUTH)
    UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
    REGISTER_FAILED: 'AUTH_REGISTER_FAILED',
    EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
    INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    PASSWORD_RESET_FAILED: 'AUTH_PASSWORD_RESET_FAILED',
    REQUEST_PASSWORD_RESET_FAILED: 'AUTH_REQUEST_PASSWORD_RESET_FAILED',
    RESET_PASSWORD_FAILED: 'AUTH_RESET_PASSWORD_FAILED',
    CHECK_AUTHORIZATION_FAILED: 'AUTH_CHECK_AUTHORIZATION_FAILED',
    NOT_PERMISSIONS: 'AUTH_NOT_PERMISSIONS',
    ACCOUNT_IS_BANNED: 'AUTH_ACCOUNT_IS_BANNED',
    TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    REFRESH_TOKEN_FAILED: 'AUTH_REFRESH_TOKEN_FAILED',
    LOGOUT_FAILED: 'AUTH_LOGOUT_FAILED',
    CHANGE_PASSWORD_FAILED: 'AUTH_CHANGE_PASSWORD_FAILED',
    CREATE_ACCOUNT_FAILED: 'AUTH_CREATE_ACCOUNT_FAILED',
    VERIFY_OTP_FAILED: 'AUTH_VERIFY_OTP_FAILED',
    
    // Validation Errors (VAL)
    VALIDATION_FAILED: 'VAL_VALIDATION_FAILED',
    INVALID_INPUT: 'VAL_INVALID_INPUT',
    MISSING_FIELDS: 'VAL_MISSING_FIELDS',
    INVALID_EMAIL: 'VAL_INVALID_EMAIL',
    INVALID_PASSWORD: 'VAL_INVALID_PASSWORD',
    PASSWORDS_DO_NOT_MATCH: 'VAL_PASSWORDS_DO_NOT_MATCH',
    
    // Data Errors (DATA)
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    USER_NOT_FOUND: 'DATA_USER_NOT_FOUND',
    POST_NOT_FOUND: 'DATA_POST_NOT_FOUND',
    COMMENT_NOT_FOUND: 'DATA_COMMENT_NOT_FOUND',
    FRIEND_NOT_FOUND: 'DATA_FRIEND_NOT_FOUND',
    MESSAGE_NOT_FOUND: 'DATA_MESSAGE_NOT_FOUND',
    DATA_CONFLICT: 'DATA_CONFLICT',
    
    // User Operations Errors (USER)
    UPDATE_PROFILE_FAILED: 'USER_UPDATE_PROFILE_FAILED',
    UPDATE_AVATAR_FAILED: 'USER_UPDATE_AVATAR_FAILED',
    UPDATE_THUMBNAIL_FAILED: 'USER_UPDATE_THUMBNAIL_FAILED',
    GET_PROFILE_FAILED: 'USER_GET_PROFILE_FAILED',
    SEARCH_USER_FAILED: 'USER_SEARCH_FAILED',
    
    // Post Operations Errors (POST)
    CREATE_POST_FAILED: 'POST_CREATE_FAILED',
    UPDATE_POST_FAILED: 'POST_UPDATE_FAILED',
    DELETE_POST_FAILED: 'POST_DELETE_FAILED',
    LIKE_POST_FAILED: 'POST_LIKE_FAILED',
    COMMENT_POST_FAILED: 'POST_COMMENT_FAILED',
    
    // Friend Operations Errors (FRIEND)
    ADD_FRIEND_FAILED: 'FRIEND_ADD_FAILED',
    REMOVE_FRIEND_FAILED: 'FRIEND_REMOVE_FAILED',
    SEND_FRIEND_REQUEST_FAILED: 'FRIEND_SEND_REQUEST_FAILED',
    ACCEPT_FRIEND_REQUEST_FAILED: 'FRIEND_ACCEPT_REQUEST_FAILED',
    REJECT_FRIEND_REQUEST_FAILED: 'FRIEND_REJECT_REQUEST_FAILED',
    
    // Message Operations Errors (MSG)
    SEND_MESSAGE_FAILED: 'MSG_SEND_FAILED',
    GET_MESSAGES_FAILED: 'MSG_GET_FAILED',
    GET_CONVERSATIONS_FAILED: 'MSG_GET_CONVERSATIONS_FAILED',
    
    // Notification Operations Errors (NOTIF)
    CREATE_NOTIFICATION_FAILED: 'NOTIF_CREATE_FAILED',
    GET_NOTIFICATIONS_FAILED: 'NOTIF_GET_FAILED',
    UPDATE_NOTIFICATION_FAILED: 'NOTIF_UPDATE_FAILED',
    
    // Server Errors (SRV)
    INTERNAL_SERVER_ERROR: 'SRV_INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SRV_UNAVAILABLE',
    DATABASE_ERROR: 'SRV_DATABASE_ERROR',
    ERR_INTERNAL_SERVER: 'SRV_INTERNAL_ERROR',
    
    // Request Errors (REQ)
    BAD_REQUEST: 'REQ_BAD_REQUEST',
    ERR_GET_DATA_FAILED: 'REQ_GET_DATA_FAILED',
    ROUTE_NOT_FOUND: 'REQ_ROUTE_NOT_FOUND'
};

const errorMessage = {
    // Auth Messages
    UNAUTHORIZED: 'Bạn cần đăng nhập để truy cập tài nguyên này',
    LOGIN_FAILED: 'Đăng nhập thất bại, vui lòng thử lại',
    REGISTER_FAILED: 'Đăng ký thất bại, vui lòng thử lại',
    EMAIL_ALREADY_EXISTS: 'Email đã tồn tại trong hệ thống',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
    PASSWORD_RESET_FAILED: 'Đặt lại mật khẩu thất bại',
    REQUEST_PASSWORD_RESET_FAILED: 'Yêu cầu đặt lại mật khẩu thất bại',
    RESET_PASSWORD_FAILED: 'Đặt lại mật khẩu thất bại',
    CHECK_AUTHORIZATION_FAILED: 'Kiểm tra xác thực thất bại',
    NOT_PERMISSIONS: 'Bạn không có quyền truy cập tài nguyên này',
    ACCOUNT_IS_BANNED: 'Tài khoản của bạn đã bị khóa',
    TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
    REFRESH_TOKEN_FAILED: 'Làm mới token thất bại',
    LOGOUT_FAILED: 'Đăng xuất thất bại',
    CHANGE_PASSWORD_FAILED: 'Thay đổi mật khẩu thất bại',
    CREATE_ACCOUNT_FAILED: 'Tạo tài khoản thất bại',
    VERIFY_OTP_FAILED: 'Xác thực OTP thất bại',
    
    // Validation Messages
    VALIDATION_FAILED: 'Dữ liệu không hợp lệ',
    INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ',
    MISSING_FIELDS: 'Thiếu thông tin bắt buộc',
    INVALID_EMAIL: 'Email không hợp lệ',
    INVALID_PASSWORD: 'Mật khẩu không hợp lệ',
    PASSWORDS_DO_NOT_MATCH: 'Mật khẩu không khớp',
    
    // Data Messages
    DATA_NOT_FOUND: 'Không tìm thấy dữ liệu',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    POST_NOT_FOUND: 'Không tìm thấy bài viết',
    COMMENT_NOT_FOUND: 'Không tìm thấy bình luận',
    FRIEND_NOT_FOUND: 'Không tìm thấy bạn bè',
    MESSAGE_NOT_FOUND: 'Không tìm thấy tin nhắn',
    DATA_CONFLICT: 'Dữ liệu bị xung đột',
    
    // User Operations Messages
    UPDATE_PROFILE_FAILED: 'Cập nhật thông tin cá nhân thất bại',
    UPDATE_AVATAR_FAILED: 'Cập nhật ảnh đại diện thất bại',
    UPDATE_THUMBNAIL_FAILED: 'Cập nhật ảnh bìa thất bại',
    GET_PROFILE_FAILED: 'Lấy thông tin cá nhân thất bại',
    SEARCH_USER_FAILED: 'Tìm kiếm người dùng thất bại',
    
    // Post Operations Messages
    CREATE_POST_FAILED: 'Tạo bài viết thất bại',
    UPDATE_POST_FAILED: 'Cập nhật bài viết thất bại',
    DELETE_POST_FAILED: 'Xóa bài viết thất bại',
    LIKE_POST_FAILED: 'Thích bài viết thất bại',
    COMMENT_POST_FAILED: 'Bình luận bài viết thất bại',
    
    // Friend Operations Messages
    ADD_FRIEND_FAILED: 'Thêm bạn bè thất bại',
    REMOVE_FRIEND_FAILED: 'Xóa bạn bè thất bại',
    SEND_FRIEND_REQUEST_FAILED: 'Gửi lời mời kết bạn thất bại',
    ACCEPT_FRIEND_REQUEST_FAILED: 'Chấp nhận lời mời kết bạn thất bại',
    REJECT_FRIEND_REQUEST_FAILED: 'Từ chối lời mời kết bạn thất bại',
    
    // Message Operations Messages
    SEND_MESSAGE_FAILED: 'Gửi tin nhắn thất bại',
    GET_MESSAGES_FAILED: 'Lấy tin nhắn thất bại',
    GET_CONVERSATIONS_FAILED: 'Lấy cuộc trò chuyện thất bại',
    
    // Server Messages
    INTERNAL_SERVER_ERROR: 'Đã xảy ra lỗi máy chủ nội bộ',
    SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng',
    DATABASE_ERROR: 'Lỗi cơ sở dữ liệu',
    ERR_INTERNAL_SERVER: 'Đã xảy ra lỗi máy chủ nội bộ',
    
    // Request Messages
    BAD_REQUEST: 'Yêu cầu không hợp lệ',
    ERR_GET_DATA_FAILED: 'Không thể lấy dữ liệu',
    ROUTE_NOT_FOUND: 'Không tìm thấy đường dẫn'
};

module.exports = {
    errorCode,
    errorMessage
}; 