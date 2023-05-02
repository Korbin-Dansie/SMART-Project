var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET new assignment page. */
router.get('/', function (req, res, next) {
    res.render('NewAssignment', {});
});

router.post('/', function (req, res, next) {
    let classID = req.query.classID;
    let pointsPossible = req.body.assignmentPoints;
    let dueDate = req.body.assignmentDueDate;
    let assignmentName = req.body.assignmentTitle;

    let sql = "CALL create_class_assignment(?, ?, ?, ?);";
    dbCon.query(sql, [assignmentName, dueDate, pointsPossible, classID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);
      //console.log(results[0]);
      //console.log(results[1]);

      res.redirect('/Course?classID=' + encodeURIComponent(classID));
    });
});

module.exports = router;