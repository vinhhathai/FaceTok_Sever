'use strict';
//----------------------------------------------------------------
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Helper to normalize IPv6 addresses to avoid bypass
const normalizeIp = (ip) => {
  if (!ip) return 'unknown';
  
  // Handle IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  // Handle IPv6 by taking the first 64 bits (network prefix)
  // This prevents a single user from bypassing limits by changing their IPv6 suffix
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':');
  }
  
  return ip;
};

// Key generator helper
const getKeyFromReq = (req) => {
  return req.user?.id || normalizeIp(req.ip);
};

/**
 * Rate limiter cho tạo post
 * Giới hạn: 10 posts / 15 phút / user
 */
const createPostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Giới hạn 10 requests
  message: {
    success: false,
    message: 'Bạn đã tạo quá nhiều bài viết. Vui lòng thử lại sau 15 phút.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  validate: false, // Disable validation warning for custom keyGenerator
  // Key generator: dựa theo user ID hoặc normalized IP
  keyGenerator: getKeyFromReq,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for create post:', {
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      ip: req.ip,
      limit: options.max,
      windowMinutes: options.windowMs / 60000,
      resetIn: `${minutesLeft} minutes`,
    });
    
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for creating posts',
      error: 'CREATE_POST_RATE_LIMIT',
      errorCode: 'CREATE_POST_RATE_LIMIT',
      details: {
        limit: options.max,
        windowMinutes: options.windowMs / 60000,
        retryAfterMinutes: minutesLeft,
        retryAfter: resetTime.toISOString(),
        type: 'create_post'
      }
    });
  },
  skip: (req) => {
    // Skip rate limit cho admin (để test)
    return req.user?.role === 'admin';
  }
});

/**
 * Rate limiter cho comment
 * Giới hạn: 30 comments / 10 phút / user
 */
const createCommentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 30,
  message: {
    success: false,
    message: 'Bạn đã bình luận quá nhiều. Vui lòng thử lại sau 10 phút.',
  },
  validate: false,
  keyGenerator: getKeyFromReq,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for create comment:', {
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      ip: req.ip,
      limit: options.max,
      windowMinutes: options.windowMs / 60000,
    });
    
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for creating comments',
      error: 'CREATE_COMMENT_RATE_LIMIT',
      errorCode: 'CREATE_COMMENT_RATE_LIMIT',
      details: {
        limit: options.max,
        windowMinutes: options.windowMs / 60000,
        retryAfterMinutes: minutesLeft,
        type: 'create_comment'
      }
    });
  },
  skip: (req) => req.user?.role === 'admin',
});

/**
 * Rate limiter cho like/unlike
 * Giới hạn: 100 likes / 5 phút / user
 */
const toggleLikeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 100,
  message: {
    success: false,
    message: 'Bạn đã thao tác quá nhanh. Vui lòng chậm lại.',
  },
  validate: false,
  keyGenerator: getKeyFromReq,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for toggle like:', {
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      ip: req.ip,
      limit: options.max,
      windowMinutes: options.windowMs / 60000,
    });
    
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for liking/unliking',
      error: 'TOGGLE_LIKE_RATE_LIMIT',
      errorCode: 'TOGGLE_LIKE_RATE_LIMIT',
      details: {
        limit: options.max,
        windowMinutes: options.windowMs / 60000,
        retryAfterMinutes: minutesLeft,
        type: 'toggle_like'
      }
    });
  },
  skip: (req) => req.user?.role === 'admin',
});

/**
 * Rate limiter cho report
 * Giới hạn: 5 reports / 1 giờ / user
 */
const createReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau 1 giờ.',
  },
  validate: false,
  keyGenerator: getKeyFromReq,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for create report:', {
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      ip: req.ip,
      limit: options.max,
      windowMinutes: options.windowMs / 60000,
    });
    
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for creating reports',
      error: 'CREATE_REPORT_RATE_LIMIT',
      errorCode: 'CREATE_REPORT_RATE_LIMIT',
      details: {
        limit: options.max,
        windowMinutes: options.windowMs / 60000,
        retryAfterMinutes: minutesLeft,
        type: 'create_report'
      }
    });
  },
  skip: (req) => req.user?.role === 'admin' || req.user?.role === 'staff',
});

/**
 * Rate limiter chung cho API
 * Giới hạn: 100 requests / 1 phút / IP
 */
const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disable all validations
});

/**
 * Rate limiter cho login
 * Giới hạn: 5 attempts / 15 phút / IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
  },
  skipSuccessfulRequests: true, // Không đếm request thành công
  validate: false,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for login:', {
      email: req.body?.email,
      ip: req.ip,
      limit: options.max,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many failed login attempts',
      error: 'LOGIN_RATE_LIMIT',
      errorCode: 'LOGIN_RATE_LIMIT',
      details: {
        limit: options.max,
        retryAfterMinutes: minutesLeft,
        type: 'login'
      }
    });
  },
});

/**
 * Rate limiter cho register
 * Giới hạn: 3 registrations / 1 giờ / IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
  },
  validate: false,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for register:', {
      email: req.body?.email,
      ip: req.ip,
      limit: options.max,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts',
      error: 'REGISTER_RATE_LIMIT',
      errorCode: 'REGISTER_RATE_LIMIT',
      details: {
        limit: options.max,
        retryAfterMinutes: minutesLeft,
        type: 'register'
      }
    });
  },
});

/**
 * Rate limiter cho upload file (general)
 * Giới hạn: 20 uploads / 1 giờ / user
 * Dùng cho: Post media, avatar, thumbnail, report images
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 20,
  message: {
    success: false,
    message: 'Bạn đã upload quá nhiều file. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 hour'
  },
  validate: false,
  keyGenerator: getKeyFromReq,
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for upload:', {
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      ip: req.ip,
      limit: options.max,
    });
    
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for file uploads',
      error: 'UPLOAD_RATE_LIMIT',
      errorCode: 'UPLOAD_RATE_LIMIT',
      details: {
        limit: options.max,
        retryAfterMinutes: minutesLeft,
        type: 'upload'
      }
    });
  },
  skip: (req) => req.user?.role === 'admin',
});

/**
 * Rate limiter cho upload avatar
 * Giới hạn: 5 uploads / 1 giờ / user
 */
const uploadAvatarLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  message: {
    success: false,
    message: 'Bạn đã thay đổi avatar quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 hour'
  },
  validate: false,
  keyGenerator: getKeyFromReq,
  skip: (req) => req.user?.role === 'admin',
  handler: (req, res, next, options) => {
    const resetTime = new Date(Date.now() + options.windowMs);
    const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
    
    logger.warn('Rate limit exceeded for avatar upload:', {
      userId: req.user?.id,
      userName: req.user?.fullName || req.user?.username,
      ip: req.ip,
      limit: options.max,
    });
    
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for avatar changes',
      error: 'AVATAR_UPLOAD_RATE_LIMIT',
      errorCode: 'AVATAR_UPLOAD_RATE_LIMIT',
      details: {
        limit: options.max,
        retryAfterMinutes: minutesLeft,
        type: 'avatar_upload'
      }
    });
  }
});

/**
 * Rate limiter cho upload thumbnail
 * Giới hạn: 5 uploads / 1 giờ / user
 */
const uploadThumbnailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  message: {
    success: false,
    message: 'Bạn đã thay đổi ảnh bìa quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 hour'
  },
  validate: false,
  keyGenerator: getKeyFromReq,
  skip: (req) => req.user?.role === 'admin',
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for thumbnail upload:', {
      userId: req.user?.id,
      ip: req.ip,
    });
    res.status(429).json({
      success: false,
      message: 'Bạn đã thay đổi ảnh bìa quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
    });
  }
});

// Backward compatibility - export apiLimiter và authLimiter từ file cũ
const apiLimiter = generalApiLimiter;
const authLimiter = loginLimiter;

module.exports = {
  // New limiters
  createPostLimiter,
  createCommentLimiter,
  toggleLikeLimiter,
  createReportLimiter,
  generalApiLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
  uploadAvatarLimiter,
  uploadThumbnailLimiter,
  
  // Backward compatibility exports
  apiLimiter,
  authLimiter,
};
