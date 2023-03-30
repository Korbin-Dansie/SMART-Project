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

var instructorDashboardRouter = require('./routes/InstructorDashboard');
var socialWorkerDashboardRouter = require('./routes/SocialWorkerDashboard');
var sponsorDashboardRouter = require('./routes/SponsorDashboard');
var personListRouter = require('./routes/PersonList');

var loginRouter = require('./routes/Login');
var applicationRouter = require('./routes/Application');
var studentRouter = require('./routes/Student');
var courseRouter = require('./routes/Course');
var newAssignmentRouter = require('./routes/NewAssignment');
var newCourseRouter = require('./routes/NewCourse');
var certificateRouter = require('./routes/Certificate');
var studentScheduleRouter = require('./routes/StudentSchedule');
var socialNoteRouter = require('./routes/NewSocialNote');
var assignmentRouter = require('./routes/Assignment');
var gradebookRouter = require('./routes/Gradebook');

var adminDashboardRouter = require('./routes/AdminDashboard');
var ownerDashboardRouter = require('./routes/OwnerDashboard');
var manageAccountRouter = require('./routes/ManageAccount');
var applicationListRouter = require('./routes/ApplicationList');
var manageApplicationRouter = require('./routes/ManageApplication');


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

app.use('/instructorDashboard', instructorDashboardRouter);
app.use('/socialWorkerDashboard', socialWorkerDashboardRouter);
app.use('/sponsorDashboard', sponsorDashboardRouter);
app.use('/personResults', personListRouter);

app.use('/login', loginRouter);
app.use('/apply', applicationRouter);
app.use('/student', studentRouter);
app.use('/course', courseRouter);
app.use('/newAssignment', newAssignmentRouter);
app.use('/newCourse', newCourseRouter);
app.use('/certificate', certificateRouter);
app.use('/studentSchedule', studentScheduleRouter);
app.use('/newSocialNote', socialNoteRouter);
app.use('/assignment', assignmentRouter);
app.use('/gradebook', gradebookRouter);

app.use('/adminDashboard', adminDashboardRouter);
app.use('/ownerDashboard', ownerDashboardRouter);
app.use('/manageAccount', manageAccountRouter);
app.use('/ApplicationList', applicationListRouter);
app.use('/manageApplication', manageApplicationRouter);

module.exports = app;
