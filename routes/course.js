var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET course overview page. */
router.get('/', function (req, res, next) {
    let classID = req.query.classID;

    let sql = "CALL select_class(?)";
    dbCon.query(sql, [classID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);

      res.render('Course', {});
    });
});

module.exports = router;