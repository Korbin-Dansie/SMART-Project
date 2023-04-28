var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET list of students that are in the group */
router.get("/students", function (req, res, next) {
  let class_time_id = req.query['class_time_id'];

  let sql = "CALL get_students_attendance_by_group(?);";
  dbCon.query(sql,[class_time_id], function (err, results) {
    if (err) {
      throw err;
    }

    let students = new Array();
    results[0].forEach((element) => {
      students.push({ ...element });
    });
    return res.send(Object.values(students));
  });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  let obj = new Object();
  // Get information about the class
  let sql = "CALL `select_class`(?);";
  let class_id = req.query['classId'];

  obj.class_id = class_id;
  dbCon.query(sql, [class_id], function (err, results) {
    if (err) {
      throw err;
    }
    // Get the group times
    let array = new Array();
    for (const group of results[0]) {
      array.push(group);
    }
    obj.groups = array;

    // Get information about the class
    obj.subject_name = results[1][0]["subject_name"];
    obj.level_name = results[1][0]["level_name"];

    res.render('Attendance', {...obj});
  });

});

/* GET POST delete all attendance then reinsert them */
router.post('/insertAttendance', function(req, res, next) {
  let obj = new Object();
  // Get information about the class
  let sql = "CALL `select_class`(?);";
  let class_id = req.query['classId'];

  obj.class_id = class_id;
  dbCon.query(sql, [class_id], function (err, results) {
    if (err) {
      throw err;
    }
    // Get the group times
    let array = new Array();
    for (const group of results[0]) {
      array.push(group);
    }
    obj.groups = array;

    // Get information about the class
    obj.subject_name = results[1][0]["subject_name"];
    obj.level_name = results[1][0]["level_name"];

    res.render('Attendance', {...obj});
  });
});



module.exports = router;
