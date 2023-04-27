var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

router.get('/', function (req, res, next) {
    let classID = req.query.classID;

    let sql = "CALL select_class_distinct_students(?); CALL select_class(?); CALL select_class_certified_students(?);";
    dbCon.query(sql, [classID, classID, classID], function (err, results) {
      if (err) {
        throw err;
      }
      //console.log(results);
      //console.log(results[5]);

      if (results[0].length > 0) {
        let studentAssignmentsSQL = "";

        for (let i = 0; i < results[0].length; i++) {
            studentAssignmentsSQL += "CALL select_student_assignments(" + results[0][i]['student_id'] + ", " + classID + "); ";
        }

        dbCon.query(studentAssignmentsSQL, function (err, studentAssignmentsResults) {
            if (err) {
              throw err;
            }
            //console.log(studentAssignmentsResults);

            let studentAssignments = [];
            for (let i = 0; i < studentAssignmentsResults.length; i += 2) {
                studentAssignments.push(studentAssignmentsResults[i]);
            }

            //console.log(studentAssignments);

            res.render('Gradebook', {students: results[0], classDetails: results[3][0], studentAssignments: studentAssignments, certifiedStudents: results[5]});

        });
      } else {
        res.render('Gradebook', {students: results[0], classDetails: results[3][0], studentAssignments: [], certifiedStudents: []});
      }
    });
});

router.post('/', function (req, res, next) {
  let assignmentID = req.body.studentAssignmentID;
  let assignmentGrade = req.body.assignmentGrade;
  let pointsPossible = req.body.pointsPossible;

  console.log(assignmentID, assignmentGrade);

  let status = 1; // Pass

  if (assignmentGrade < pointsPossible / 2) {
    status = 2; // Fail
  }

  let sql = "CALL update_student_assignment_grade(?, ?, ?);";
  dbCon.query(sql, [assignmentID, assignmentGrade, status], function (err, results) {
    if (err) {
      throw err;
    }
    //console.log(results);
    //console.log(results[3][0]);

  });

});

module.exports = router;