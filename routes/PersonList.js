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

    console.log(results);
    console.log(results[0]);
    console.log(results[1]);

    // Get personList to dynamically change to add students to certain class times based on what class times are in the class
    let sql2 = "CALL select_class_times(?);";
    dbCon.query(sql, [classID], function (err, results2) {
      if (err) {
        throw err;
      }
  
      console.log(results2);
      console.log(results2[0]);
      console.log(results2[1]);
    //res.render('Course', {classTimes: results[0], classData: results[1][0], classID: classID});
    });
  });
  // Display the page with add/remove buttons
  res.render('PersonList', );

  // TODO: set it up to recieve a POST to add/remove students then redirect to the right course page again
});

module.exports = router;
