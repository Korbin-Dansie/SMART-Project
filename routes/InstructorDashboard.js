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

      res.render('InstructorDashboard', {});
      
    });
  
});

module.exports = router;
