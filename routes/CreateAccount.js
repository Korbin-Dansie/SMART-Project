var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

router.get('/', function(req, res, next) {
  if (req.session.loggedIn && (req.session.accountType == 0 || req.session.accountType == 1)) {
    res.render('CreateAccount');
  } else {
    res.redirect('/');
  }
  
});

router.post('/', function(req, res, next) {
    // Get the POST data
    const accountType = req.body.accountType;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.emailAddress;
    const hash = req.body.hash;
    const salt = req.body.salt;

    let sql = "CALL create_user(?, ?, ?, ?, ?, ?, @result); select @result;";
    dbCon.query(sql, [accountType, firstName, lastName, email, hash, salt], function (err, rows) {
      if (err) {
        throw err;
      }
      if (rows[1][0]['@result'] == 0) {
        // Account created successfully
        console.log("CreateAccount.js: Account successfully created");
        res.render('ConfirmationScreen', { message: "New " + accountType + " created associated to " + email});
      } else {
        // This email address is already being used
        console.log("CreateAccount.js: Email address already in use");
        res.render('CreateAccount', { message: "The email address '" + email + "' is already registered to an account"});
      }
    });
});

module.exports = router;
