var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  let instructorID = req.session.userID;

  let sql = "CALL select_instructor_classes(?);";
    dbCon.query(sql, [instructorID], function (err, results) {
      if (err) {
        throw err;
      }
      console.log(results);

      res.render('InstructorDashboard', {classes: results[0]});
      
    });
  
});

router.post('/', function(req, res, next) {
  if (req.body.classID_grades === undefined) {
    let dataToPass = encodeURIComponent(req.body.classID);
    res.redirect('/Course?classID=' + dataToPass);
  } else {
    let dataToPass = encodeURIComponent(req.body.classID_grades);
    res.redirect('/Gradebook?classID=' + dataToPass);
  }
  
});

module.exports = router;
