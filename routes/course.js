var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET course overview page. */
router.get('/', function (req, res, next) {
    let classID = req.query.classID;

    let sql = "CALL select_class(?); CALL select_class_distinct_students(?);";
    dbCon.query(sql, [classID, classID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);
      //console.log(results[0]);
      //console.log(results[1]);

      res.render('Course', {classTimes: results[0], classData: results[1][0], classStudents: results[3]});
    });
});

module.exports = router;