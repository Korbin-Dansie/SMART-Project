var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("Get ManageApplication.js");

  let applicationID = req.query.applicationID;

  if (applicationID) {
    let sql = "CALL select_application_details(?); CALL get_personid_from_applicationid(?, @personid); CALL select_contact_info(@personid); CALL select_guardians(?);";
    dbCon.query(sql, [applicationID, applicationID, applicationID], function (err, results) {
      if (err) {
        throw err;
      }
      //console.log(results);
      console.log(results[0][0]);
      console.log(results[3]);
      console.log(results[5]);
  
      res.render('ManageApplication', {applicationData: results[0][0], contactInfo: results[3], guardians: results[5][0]});
    });
  } else {
    res.redirect('/');
  }
  
});

module.exports = router;
