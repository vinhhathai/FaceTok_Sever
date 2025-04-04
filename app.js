'use strict';
//----------------------------------------------------------------
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user/user');
var messageRouter = require('./routes/message/message');
var friendRouter = require('./routes/friend/friend');
var searchRouter = require('./routes/search/search');
const DBConnection = require('./DBConnection/DBConnection');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger'); // Đường dẫn tới file swagger.js
//-----------------------------------END IMPORTING--------------------------------

var app = express();

app.use(logger('dev'));

// Cấu hình middleware xử lý JSON và form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
//END SETUP ENGINE----------------------------------------------------------------

//CONNECT TO DB
const connect = new DBConnection();
connect.connect();

// Debug kết nối database
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

//Excute main routes
// Tạo endpoint cho Swagger UI
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', indexRouter);
app.use('/user', usersRouter); // Đảm bảo router user được đăng ký
app.use('/message', messageRouter); // Thêm route cho tin nhắn
app.use('/friend', friendRouter); // Thêm route cho tính năng kết bạn
app.use('/search', searchRouter); // Thêm route cho tìm kiếm

// Middleware xử lý lỗi JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err);
    return res.status(400).json({ 
      message: 'Invalid JSON in request body',
      error: err.message
    });
  }
  next(err);
});

module.exports = app;
