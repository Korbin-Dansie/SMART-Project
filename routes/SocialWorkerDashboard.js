var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  let obj = new Object();
  getStep1(req, res, obj);
});

// Get all students to display in a list
function getStep1(req, res, obj){
  let sql = "call get_students";
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
    res.render('SocialWorkerDashboard', {...obj});
  });
}

module.exports = router;
