var express = require('express');
var router = express.Router();
var CryptoJS = require('../node_modules/crypto-js');

var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("login.js: GET");
    res.render('loginuser', {});
  });
  
  /* POST page. */
  router.post('/', function(req, res, next) {
    // if they are already logged in, send them to the dashboard
    if (req.session.loggedIn) {
        res.redirect('/');  // index page will redirect to appropriate dashboard
    }
      console.log("login.js: POST");
      console.log("The email in variable is '" + req.body.emailAddress + "'");
      console.log("The hashedPassword in variable is '" + req.body.hashedPassword + "'");
      if (req.body.hashedPassword) {
        // User is submitting user/password credentials
        const emailAddress = req.session.emailAddress;
        const hashedPassword = req.body.hashedPassword;
  
        const sql = "CALL login_user ('" + emailAddress + "', '" + hashedPassword + "', @account_type); SELECT @account_type";
        dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }
            console.log("login.js: Obtained result from accounts table below");
            console.log(results);
            
            console.log(results[1]);
            console.log(results[1][0]);
            console.log(results[1][0]['@account_type']);
            if (results[1][0]['@account_type'] === undefined || results[1][0]['@account_type'] == 0) {
                console.log("login.js: No login credentials found");
                res.render('loginuser', {message: "Password not valid for user '" + emailAddress + "'.  Please log in again."});
            }
            else {
                console.log("login.js: Credentials matched");
                req.session.loggedIn = true;
                req.session.accountType = results[1][0]['@account_type'];
                dbCon.query("CALL get_userid_from_email('" + emailAddress + "', @userID); SELECT @userID;", function(err, results) {
                    if (err) {
                        throw err;
                    }
                    console.log(results);
                    console.log(results[1][0]['@userID']);
                    req.session.userID = results[1][0]['@userID']
                    res.redirect("/");
                });
                
            }
        });
    } 
    else if (req.body.emailAddress != "") { // They just put in their email address
      const emailAddress = req.body.emailAddress;
      req.session.emailAddress = emailAddress;
      console.log("login.js: email is: " + emailAddress);
      const sql = "CALL get_salt('" + emailAddress + "', @salt); SELECT @salt;";
      dbCon.query(sql, function(err, results) {
          if (err) {
              throw err;
          }
          console.log(results[1][0]);
          console.log(results[1][0]['@salt']);
          // make a random salt to use if their email turns out to not be valid
          let salt = CryptoJS.lib.WordArray.random(8);
          if (results[1][0]['@salt'] === undefined || results[1][0]['@salt'] === null || results[1][0]['@salt'] == '') {
              console.log("login: No results found");
              // send them to the login page anyways if they have an email that doesn't exist for security
          } else {
              salt = results[1][0]['@salt'];
          }
          // Log them in regardless of whether the email is good
          req.session.salt = salt;
          console.log("email: " + emailAddress + " salt: " + salt);
          res.render('loginpassword', {
              emailAddress: emailAddress,
              salt: salt});
      });
  
    }
  
  });

module.exports = router;