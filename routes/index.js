var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(process.env.DEBUG == "1"){
    res.render('index', { title: 'Express'});
  }
  else{
    if (req.session.loggedIn) {
      switch (req.session.accountType) {
        case "Super Admin":
        case "Admin":
          res.render('AdminDashboard', {});
          break;
        case "Instructor":
          res.render('InstructorDashboard', {});
          break;
        case "Social Worker":
          res.render('SocialWorkerDashboard', {});
          break;
        case "Owner":
          res.render('OwnerDashboard', {});
          break;
        case "USA Sponsor":
          res.render('SponsorDashboard', {});
          break;
        default:
          res.render('LandingPage', {message: "Unhandled account type"});
      }
    } else {
      res.render('LandingPage', { title: 'Express'});
    }
  }
});

module.exports = router;
