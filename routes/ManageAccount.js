var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  let userID = req.query.userID;

  let sql = "CALL select_user_details(?);"
  dbCon.query(sql, [userID], function (err, results) {
    if (err) {
      throw err;
    }
    
    console.log(results);

    res.render("ManageAccount", {userDetails: results[0][0]});
  });
  
});

router.post("/", function (req, res, next) {
  let userID = req.query.userID;

  let firstName = req.body.userFirstName;
  let lastName = req.body.userLastName;
  let email = req.body.userEmail;
  let accountType = req.body.accountType;
  let isActive = req.body.isAccountActive;

  let sql = "CALL update_user_details(?, ?, ?, ?, ?, ?);"
  dbCon.query(sql, [userID, firstName, lastName, email, accountType, isActive], function (err, results) {
    if (err) {
      throw err;
    }
    
    console.log(results);

    let dataToPass = encodeURIComponent(userID);
    res.redirect('/ManageAccount?userID=' + dataToPass);
  });
  
});

module.exports = router;
