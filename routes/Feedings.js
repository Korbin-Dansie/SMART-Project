var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  let obj = new Object();
  getStep1(req, res, obj);
});

// Load the current feedings for today
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

// Load the current meal times
function getStep2(req, res, obj){
  res.render('Feedings', {...obj});
}


module.exports = router;
