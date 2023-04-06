var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("Get ManageApplication.js");

  let applicationID = req.query.applicationID;

  if (applicationID) {
    const sql = "CALL select_application_details(" + applicationID + ")";
    dbCon.query(sql, function (err, results) {
      if (err) {
        throw err;
      }
      //console.log(results);
      console.log(results[0][0]);
  
      res.render('ManageApplication', {applicationData: results[0][0]});
    });
  } else {
    res.redirect('/');
  }
  
});

module.exports = router;
