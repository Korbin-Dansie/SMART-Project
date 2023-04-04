var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(process.env.DEBUG == "1"){
    res.render('index', { title: 'Express'});
  }
  else{
    res.render('LandingPage', { title: 'Express'});
  }
});

module.exports = router;
