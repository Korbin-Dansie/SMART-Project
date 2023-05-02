var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET persons page. */
router.get('/', function(req, res, next) {
  res.render('PersonList');
});

router.post('/', function(req, res, next) {
  if (req.body.adminManageUsers != undefined) {
    let sql = "CALL select_users(?);";
    if (req.body.accountTypeSelect == "noFilter") {
      dbCon.query(sql, [null], function (err, results) {
        if (err) {
          throw err;
        }
        
        console.log(results);

        res.render('PersonList', {users: results[0], accountType: req.body.accountTypeSelect, admin: true});
      });
    } else {

      dbCon.query(sql, [req.body.accountTypeSelect], function (err, results) {
        if (err) {
          throw err;
        }
        
        console.log(results);

        res.render('PersonList', {users: results[0], accountType: req.body.accountTypeSelect, admin: true});
      });
    }
  }
});

/* GET add Student page. */
router.get('/addStudent', loadStudentsPage);

function parseStudentClassInfo(studentTable, class_time_table, res, classID){
  // Iterate through the class times, make an array of them and find the highest group number
  var groups = 0;
  var class_time_list = [];
  class_time_table.forEach(function (classTime) {
    if (classTime["group"] > groups) groups = classTime["group"];
    var weekday = classTime['name'].slice(0,3);
    var startTime = classTime["start_time"].slice(0,5);
    var endTime = classTime["end_time"].slice(0,5);
    var groupNum = classTime["group"] + 1;
    class_time_list.push({id:classTime["class_time_id"], value: (weekday + " " + startTime + "-" + endTime), group: groupNum })
  });
  // Create a better table of all students
  var studentArray = [];
  studentTable.forEach(function (student) {
    // Make sure the student isn't already in the list we have
    let processedStudent = false;
    var studentObject = {};
    for (i = 0; i < studentArray.length; i ++){
      if (studentArray[i]['id'] == student['student_id']){
        processedStudent = true;
        studentObject = studentArray[i];
        break;
      }
    }
    if (!processedStudent){
      // Add the student to the set
      studentObject = {id: student["student_id"], name: student["first_name"] + " " + student["last_name"]}
      for (i = 0; i <= groups; i ++){
        studentObject['group_'+i] = null;
      }
      studentArray.push(studentObject);
    } 
    var class_time = student["class_time_id"];
    if (class_time != null) {
      // Find what group the class time is in
      var class_group = student["group"];
      // Add the new class time to the student
      studentObject['group_'+class_group] = class_time;
    }
  });
  console.log(class_time_list);
  console.log('=========================================================');
  console.log('studentTable: ');
  console.log(studentArray);
  // Display the page with add/remove buttons
  res.render('AddStudent', {classTimes: class_time_list, studentTable: studentArray, totalClassGroups: groups, classID});
}

router.post('/addStudent', function(req, res, next) {
  // Get the variables
  var action = req.body.action;
  var student = Number(req.body.student);
  var classTime = Number(req.body.classTime);
  
  var deleteSql = "DELETE student_schedule FROM student_schedule "
  + "JOIN class_time ON student_schedule.class_time_id = class_time.class_time_id "
  + "WHERE student_id = ? AND class_id = "
  + "(SELECT class_id FROM class_time WHERE class_time_id = ?) "
  + "AND `group` = "
  + "(SELECT `group` FROM class_time WHERE class_time_id = ?); "
  // Check the action
  if (action == 'add'){
    // If add student:
    // If the student is already added to a class time in that group, remove it
      dbCon.query(deleteSql, [student, classTime, classTime], function (err, results) {
        if (err) {
          throw err;
        }
        // Add the student to the class time
        var sql2 = "INSERT INTO student_schedule (student_id, class_time_id) "
          + "VALUES (?, ?);"
        dbCon.query(sql2, [student, classTime], function (err, results) {
          if (err) {
            throw err;
          }
          // Load the same page
          loadStudentsPage(req, res, next);
        });
      });
  } else if (action == 'remove'){
  // If remove student:
    // Remove the student from that class time
    dbCon.query(deleteSql, [student, classTime, classTime], function (err, results) {
      if (err) {
        throw err;
      }
      // Load the same page
      loadStudentsPage(req, res, next);
    });
  } else {loadStudentsPage(req, res, next);}
});

function loadStudentsPage(req, res, next) {
  // Get the course ID
  let classID = req.query.classID;
  // Generate the proper data
  //   List of students and if they're in the class
  let sql = "CALL select_students_and_class_status(?);";
  dbCon.query(sql, [classID], function (err, results) {
    if (err) {
      throw err;
    }

    console.log(results[0]);
    console.log('========================================================');

    // Get personList to dynamically change to add students to certain class times based on what class times are in the class
    let sql2 = "CALL select_class_times(?);";
    dbCon.query(sql2, [classID], function (err, results2) {
      if (err) {
        throw err;
      }
  
      console.log(results2[0]);
      parseStudentClassInfo(results[0], results2[0], res, classID);

    });
  });
}

module.exports = router;
