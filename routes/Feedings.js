var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET list of students that need feeding */
router.get('/students', function(req, res, next) {
  let sql = "CALL get_students_with_meal_assistance();";
  dbCon.query(sql, function (err, results) {
    if (err) {
      throw err;
    }

    let students = new Array();
    results[0].forEach(element => {
      students.push(
            {...element}
        );
    });
    return res.send(Object.values(students));
  });
});

/* GET list of students that are feed today */
router.get('/date', function(req, res, next) {
  let date = req.query.date;
  if(date == undefined){
    date = null;
  }
  let sql = "CALL get_feedings(?);";
  dbCon.query(sql, [req.query.date], function (err, results) {
    if (err) {
      throw err;
    }

    // If we did not send a date return null
    if(results[0] == undefined){
      return res.send([]);
    }

    let feedings = new Array();
    results[0].forEach(element => {
      feedings.push(
            {...element}
        );
    });
    return res.send(Object.values(feedings));
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  let obj = new Object();
  getStep1(req, res, obj);
});

// Load the meal times
function getStep1(req, res, obj){
  let sql = "CALL `get_meal_times`()";
  dbCon.query(sql, function (err, results) {
    if (err) {
      throw err;
    }

    let meal_times = new Array();
    results[0].forEach(element => {
      meal_times.push(
            {...element}
        );
    });

    obj.meal_times = meal_times;
    getStep2(req, res, obj)
  });
}

// Load the current students in need of meal assistance
function getStep2(req, res, obj){
  let sql = "CALL get_students_with_meal_assistance();";
  dbCon.query(sql, function (err, results) {
    if (err) {
      throw err;
    }

    let students = new Array();
    results[0].forEach(element => {
      students.push(
            {...element}
        );
    });

    obj.students = students;
    getStep3(req, res, obj)
  });
}

// Load if anybody has already been feed
function getStep3(req, res, obj){
    res.render('Feedings', {...obj});
}

module.exports = router;
