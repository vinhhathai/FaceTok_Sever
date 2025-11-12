#!/usr/bin/env node

/**
 * CRITICAL SECURITY FIXES - Quick Implementation Script
 * Run this to install and configure essential security packages
 * 
 * Usage: node security-quick-fix.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting Critical Security Fixes...\n');

// 1. Install required packages
console.log('📦 Installing security packages...');
try {
  execSync('npm install express-rate-limit express-mongo-sanitize winston --save', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Packages installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install packages:', error.message);
  process.exit(1);
}

// 2. Create logger utility
console.log('📝 Creating logger utility...');
const loggerCode = `"use strict";
//----------------------------------------------------------------
const winston = require('winston');

/**
 * Centralized logging system
 * Replaces console.log with proper logging
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chaotok-api' },
  transports: [
    // Write errors to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
`;

const loggerPath = path.join(__dirname, 'src/shared/utils/logger.js');
fs.writeFileSync(loggerPath, loggerCode);
console.log('✅ Logger created at:', loggerPath, '\n');

// 3. Create rate limiting middleware
console.log('📝 Creating rate limiting middleware...');
const rateLimitCode = `"use strict";
//----------------------------------------------------------------
const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware to prevent brute force and DoS attacks
 */

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter (10 uploads per hour)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many upload requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};
`;

const rateLimitPath = path.join(__dirname, 'src/shared/middlewares/rateLimitMiddleware.js');
fs.writeFileSync(rateLimitPath, rateLimitCode);
console.log('✅ Rate limiter created at:', rateLimitPath, '\n');

// 4. Create updated app.js instructions
console.log('📝 Generating app.js update instructions...');
const appUpdateInstructions = `
========================================================================================
MANUAL STEP REQUIRED: Update src/app.js
========================================================================================

Add these lines after line 46 (after cookieParser):

// Import security middlewares
const mongoSanitize = require('express-mongo-sanitize');
const { apiLimiter } = require('./shared/middlewares/rateLimitMiddleware');
const logger = require('./shared/utils/logger');

// Security: Sanitize user input to prevent NoSQL injection
app.use(mongoSanitize());

// Security: Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Replace console.log with logger
// Example: console.log('MongoDB connected') → logger.info('MongoDB connected')

========================================================================================
`;

fs.writeFileSync(path.join(__dirname, 'APP_UPDATE_INSTRUCTIONS.txt'), appUpdateInstructions);
console.log('✅ Instructions saved to APP_UPDATE_INSTRUCTIONS.txt\n');

// 5. Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log('✅ Created logs directory\n');
}

// 6. Update .gitignore
console.log('📝 Updating .gitignore...');
const gitignorePath = path.join(__dirname, '.gitignore');
let gitignoreContent = fs.existsSync(gitignorePath) 
  ? fs.readFileSync(gitignorePath, 'utf8')
  : '';

if (!gitignoreContent.includes('logs/')) {
  gitignoreContent += '\\n# Logs\\nlogs/\\n*.log\\n';
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ Updated .gitignore\n');
}

// 7. Summary
console.log('\\n' + '='.repeat(80));
console.log('✅ CRITICAL SECURITY FIXES INSTALLED');
console.log('='.repeat(80));
console.log('\\n📦 Installed Packages:');
console.log('  - express-rate-limit');
console.log('  - express-mongo-sanitize');
console.log('  - winston (logger)');
console.log('\\n📁 Created Files:');
console.log('  - src/shared/utils/logger.js');
console.log('  - src/shared/middlewares/rateLimitMiddleware.js');
console.log('  - logs/ (directory)');
console.log('  - APP_UPDATE_INSTRUCTIONS.txt');
console.log('\\n⚠️  MANUAL STEPS REQUIRED:');
console.log('  1. Update src/app.js (see APP_UPDATE_INSTRUCTIONS.txt)');
console.log('  2. Replace console.log with logger throughout codebase');
console.log('  3. Add authLimiter to auth routes:');
console.log('     app.post(\\'/api/auth/login\\', authLimiter, ...)');
console.log('  4. Add uploadLimiter to upload routes');
console.log('  5. Restart server: npm run start');
console.log('\\n' + '='.repeat(80));
console.log('\\nNext: Run npm audit to check for vulnerable dependencies\\n');
