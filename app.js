var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// support to call database
require('dotenv').config();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var instructorDBRouter = require('./routes/InstructorDashboard');
var loginRouter = require('./routes/login');
var applicationRouter = require('./routes/application');
var studentRouter = require('./routes/student');
var courseRouter = require('./routes/course');

var adminDashboardRouter = require('./routes/AdminDashboard');
var ownerDashboardRouter = require('./routes/OwnerDashboard');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap-icons/')));


// This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/instructorDB', instructorDBRouter);
app.use('/login', loginRouter);
app.use('/apply', applicationRouter);
app.use('/student', studentRouter);
app.use('/course', courseRouter);

app.use('/adminDashboard', adminDashboardRouter);
app.use('/ownerDashboard', ownerDashboardRouter);

module.exports = app;
