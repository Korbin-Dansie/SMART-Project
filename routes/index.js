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
        case 1:
        case 2:
          res.redirect('/AdminDashboard');
          break;
        case 3:
          res.redirect('/InstructorDashboard');
          break;
        case 4:
          res.redirect('/SocialWorkerDashboard');
          break;
        case 5:
          res.redirect('/OwnerDashboard');
          break;
        case 6:
          res.redirect('/SponsorDashboard');
          break;
        default:
          res.render('LandingPage', {message: "Unhandled account type"});
      }
    } else {
      res.render('LandingPage', { title: 'Express'});
    }
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
      if (err) {
        throw err;
      }   
      res.redirect('/'); 
  });
});

module.exports = router;
