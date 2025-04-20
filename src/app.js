'use strict';
//----------------------------------------------------------------
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./shared/swagger/swagger');

// Kết nối database
const DBConnection = require('./shared/database/DBConnection');

// Import modules
const userModule = require('./modules/user');
// const postModule = require('./modules/post');
const messageModule = require('./modules/message');
const friendModule = require('./modules/friend');
const notificationModule = require('./modules/notification');
const authModule = require('./modules/auth');

// Middleware handler cho lỗi JSON
const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parse Error:', err);
        return res.status(400).json({ 
            message: 'Invalid JSON in request body',
            error: err.message
        });
    }
    next(err);
};

// Khởi tạo ứng dụng
const app = express();

// Cấu hình middleware cơ bản
app.use(helmet());
app.use(logger('dev'));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../public', 'uploads')));

// Kết nối database
const connect = async () => {
    const dbConnection = new DBConnection();
    await dbConnection.connect();
};

connect();

// Debug kết nối database
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

// Đăng ký routes từ các module
app.use('/user', userModule.routes);
// app.use('/post', postModule.routes);
app.use('/message', messageModule.routes);
app.use('/friend', friendModule.routes);
app.use('/notification', notificationModule.routes);
app.use('/auth', authModule.routes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Định tuyến gốc
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to FaceTok API' });
});

// Middleware xử lý lỗi JSON
app.use(jsonErrorHandler);

// Xử lý lỗi 404
app.use((req, res, next) => {
    res.status(404).json({
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        message: 'Resource not found'
    });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        message: 'Internal server error',
        error: err.message
    });
});

module.exports = app; 