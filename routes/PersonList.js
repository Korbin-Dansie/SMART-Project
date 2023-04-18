var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('PersonList');
});

/* GET home page. */
router.get('/addStudent', function(req, res, next) {
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
      parseStudentClassInfo(results[0], results2[0], res);

    });
  });

  // TODO: set it up to recieve a POST to add/remove students then show the page again
});

function parseStudentClassInfo(studentTable, class_time_table, res){
  // Iterate through the class times, make an array of them and find the highest group number
  var groups = 0;
  var class_time_list = [];
  class_time_table.forEach(function (classTime) {
    if (classTime["group"] > groups) groups = classTime["group"];
    var weekday = classTime['name'].slice(0,3);
    var startTime = classTime["start_time"].slice(0,5);
    var endTime = classTime["end_time"].slice(0,5);
    class_time_list.push({id:classTime["class_time_id"], value: (weekday + " " + startTime + "-" + endTime)})
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
  res.render('AddStudent', {classTimes: class_time_list, studentTable: studentArray, totalClassGroups: groups});
}

module.exports = router;
