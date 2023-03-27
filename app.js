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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/instructorDB', instructorDBRouter);


module.exports = app;
