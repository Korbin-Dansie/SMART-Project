var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET course overview page. */
router.get('/', function (req, res, next) {
    let classID = req.query.classID;

    let sql = "CALL select_class(?); CALL select_class_distinct_students(?); CALL select_class_assignments(?);";
    dbCon.query(sql, [classID, classID, classID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);
      //console.log(results[0]);
      //console.log(results[1]);

      res.render('Course', {classTimes: results[0], classData: results[1][0], classStudents: results[3], classAssignments: results[5], classID: classID});
    });
});

// DBID in the url of a get request to course page

module.exports = router;