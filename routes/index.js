var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  let databaseString;

  let sql = "SELECT some_text FROM test";
  dbCon.query(sql, function (err, rows) {
  if (err) {
    console.log(err.message);
      throw err;
  }

  databaseString = rows[0].some_text;

  res.render('index', { title: 'Express', databaseString: databaseString });

  });
});

module.exports = router;
