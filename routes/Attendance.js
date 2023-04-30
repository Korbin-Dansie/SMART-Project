var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET list of students that are in the group */
router.get("/students", function (req, res, next) {
  let class_time_id = req.query["class_time_id"];

  let sql = "CALL get_students_by_group(?);";
  dbCon.query(
    sql,
    [class_time_id],
    function (err, results) {
      if (err) {
        throw err;
      }

      let students = new Array();
      results[0].forEach((element) => {
        students.push({ ...element });
      });
      return res.send(Object.values(students));
    }
  );
});


/* GET list of students that are in the group */
router.get("/attendance", function (req, res, next) {
  let class_time_id = req.query["class_time_id"];
  let start_date = req.query["startDate"];
  let end_date = req.query["endDate"];

  let sql = "CALL get_attendance_by_group(?, ?, ?);";
  dbCon.query(
    sql,
    [class_time_id, start_date, end_date],
    function (err, results) {
      if (err) {
        throw err;
      }

      let students = new Array();
      results[0].forEach((element) => {
        students.push({ ...element });
      });
      return res.send(Object.values(students));
    }
  );
});

/* GET home page. */
router.get("/", function (req, res, next) {
  let obj = new Object();
  // Get information about the class
  let sql = "CALL `select_class`(?);";
  let class_id = req.query["classId"];

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

    res.render("Attendance", { ...obj });
  });
});

/* GET POST delete all attendance then reinsert them */
router.post("/insertAttendance", function (req, res, next) {
  // Get information about the class
  let class_id = req.body["classId"];
  let class_time_id = req.body["group-time"];
  let date = req.body["attendance-date"];
  let start_date = req.body["startDate"];
  let end_date = req.body["endDate"];

  // Check if we have student ids
  // If we only have 1 id we have to treat it differnt because it is not an array.
  let studentIds = new Array();
  if (req.body["student-id"] != undefined) {
    // If it is an array set studentIds equal to id
    if (Array.isArray(req.body["student-id"])) {
      studentIds = new Array(...req.body["student-id"]);
    } else {
      studentIds = new Array(req.body["student-id"]);
    }
  }

  // Delete all attendance between two dates.
  let sql = "CALL `delete_attendance`(?, ?, ?);";
  dbCon.query(sql, [class_time_id, start_date, end_date], function (err, results) {
      if (err) {
        throw err;
      }

      // For each student id insert an attendance
      // For each student Id insert it into the database
      for (let index = 0; index < studentIds.length; index++) {
        let currentStudentId = studentIds[index];
        let sql = "CALL add_attendance(?,?,?,?)";

        // Get the data from the form to tell wether the user clicked feed or not feed
        let is_done = req.body[`options-outlined[${currentStudentId}]`];

        // Now insert into the database
        dbCon.query(sql,[class_time_id, currentStudentId, date, is_done],function (err, results) {
            if (err) {
              throw err;
            }

            // See if we are done with the for loop and it so return to the feedings page
            if (index + 1 == studentIds.length) {
              let params = new URLSearchParams();
              params.append("date", date);
              params.append("classId", class_id);
              params.append("class_time_id", class_time_id);
              params.append("save", 1);
              return res.redirect(
                req.baseUrl + "/?" + encodeURI(params.toString())
              );
            }
          }
        ); // End of add
      }

      // If we have no student return
      if (studentIds.length == 0) {
        let params = new URLSearchParams();
        params.append("date", date);
        params.append("classId", class_id);
        params.append("class_time_id", class_time_id);
        params.append("save", 1);
        return res.redirect(req.baseUrl + "/?" + encodeURI(params.toString()));
      }
    }
  );
});

module.exports = router;
