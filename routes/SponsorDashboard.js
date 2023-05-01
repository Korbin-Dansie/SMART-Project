var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {

  let sponsorID = req.session.userID;

  let sql = "CALL get_sponsored_students(?);";
    dbCon.query(sql, [sponsorID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);

      res.render('sponsorDashboard', {students: results[0]});

    });

});

module.exports = router;
