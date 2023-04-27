var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET certificate page. */
router.get('/', function (req, res, next) {
    let classID = req.query.classID;
    let studentID = req.query.studentID;

    let sql = "CALL select_student_certificate(?, ?);";

    dbCon.query(sql, [classID, studentID], function (err, results) {
        if (err) {
          throw err;
        }

        console.log(results);

        res.render('Certificate', {classDetails: results[1][0], certificateDetails: results[2][0]});
    });
});

router.post('/', function (req, res, next) {
    let classID = req.body.classID;
    let studentID = req.body.studentID;

    let sql = "CALL award_certificate(?, ?);";
    dbCon.query(sql, [classID, studentID], function (err, results) {
        if (err) {
        throw err;
        }
        //console.log(results);
        //console.log(results[3][0]);

    });
});

module.exports = router;