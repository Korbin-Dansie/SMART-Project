var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET application form page. */
router.get('/', function (req, res, next) {

    let sql = "CALL select_subjects(); CALL select_subject_class_counts(); CALL select_subject_certificate_counts();";
    dbCon.query(sql, function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);
      //console.log(results[0]);
      //console.log(results[1]);

      res.render('OwnerDashboard', {certificateSubjects: results[0], classSubjectCounts: results[2], certificateSubjectCounts: results[4]});
    });
});

module.exports = router;