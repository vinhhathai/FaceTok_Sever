'use strict';
//----------------------------------------------------------------
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user/user');
const DBConnection = require('./DBConnection/DBConnection');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger'); // Đường dẫn tới file swagger.js
//-----------------------------------END IMPORTING--------------------------------

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
//END SETUP ENGINE----------------------------------------------------------------

//CONNECT TO DB
const connect = new DBConnection();
connect.connect();
//Excute main routes
// Tạo endpoint cho Swagger UI
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', indexRouter);



module.exports = app;
