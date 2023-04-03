var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

router.get('/', function(req, res, next) {
  res.render('CreateAccount');
});

router.post('/', function(req, res, next) {
    // Get the POST data
    const accountType = req.body.accountType;
    const email = req.body.emailAddress;
    const hash = req.body.hash;
    const salt = req.body.salt;

    let sql = "CALL create_user(?, ?, ?, ?, @result); select @result;";
    console.log("CreateAccount.js: sql statement is: " + sql);
    // For now there isn't a lookup table for the user types, so until that gets created we'll just use 1 for the account type id
    dbCon.query(sql, [1, email, hash, salt], function (err, rows) {
      if (err) {
        throw err;
      }
      if (rows[1][0]['@result'] == 0) {
        // Account created successfully
        console.log("CreateAccount.js: Account successfully created");
        res.render('CreateAccount', { message: "New " + accountType + " created associated to " + email});
      } else {
        // This email address is already being used
        console.log("CreateAccount.js: Email address already in use");
        res.render('CreateAccount', { message: "The email address '" + email + "' is already registered to an account"});
      }
    });
});

module.exports = router;
