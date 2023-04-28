var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

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



module.exports = router;
