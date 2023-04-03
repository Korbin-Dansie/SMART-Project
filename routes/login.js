var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET login user page. */
/*
router.get('/', function (req, res, next) {
    res.render('LoginUser', {});
});
*/

/* GET login password page. localhost:3000/login/password */
/*
router.get('/password', function (req, res, next) {
    res.render('LoginPassword', {});
});
*/

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("login.js: GET");
    res.render('loginuser', {});
  });
  
  /* POST page. */
  router.post('/', function(req, res, next) {
    // if they are already logged in, send them to the dashboard
    if (req.session.loggedIn) {
        res.redirect('AdminDashboard'); // TODO: this will need to be changed to the generic dashboard
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
            console.log("loginuser.js: Obtained result from accounts table below");
            console.log(results);
            
            console.log(results[1]);
            console.log(results[1][0]);
            console.log(results[1][0]['@account_type']);
            if (results[1][0]['@account_type'] === undefined || results[1][0]['@account_type'] == 0) {
                console.log("loginuser.js: No login credentials found");
                res.render('loginuser', {message: "Password not valid for user '" + emailAddress + "'.  Please log in again."});
            }
            else {
                console.log("loginuser.js: Credentials matched");
                req.session.loggedIn = true;
                req.session.accountType = results[1][0]['@account_type'];
                req.session.viewingAccount = false;
                res.redirect("/");
            }
        });
    } 
    else if (req.body.emailAddress != "") { // They just put in their email address
      const emailAddress = req.body.emailAddress;
      console.log("loginuser.js: email is: " + emailAddress);
      const sql = "CALL get_salt('" + emailAddress + "', @salt); SELECT @salt;";
      dbCon.query(sql, function(err, results) {
          if (err) {
              throw err;
          }
          console.log(results[1][0]);
          console.log(results[1][0]['@salt']);
          if (results[1][0]['@salt'] === undefined || results[1][0]['@salt'] === null || results[1][0]['@salt'] == '') {
              console.log("loginuser: No results found");
              // send them to the login page anyways if they have an email that doesn't exist for security
              // Send a random salt since it won't work anyways
                let salt = CryptoJS.lib.WordArray.random(8);
              res.render('loginpassword', {
                email: emailAddress,
                salt: salt});
          } else {
              const salt = results[1][0]['@salt'];
              req.session.emailAddress = emailAddress;
              req.session.salt = salt;
              console.log("email: " + emailAddress + " salt: " + salt);
              res.render('loginpassword', {
                  emailAddress: emailAddress,
                  salt: salt});
          }
      });
  
    }
  
  });

module.exports = router;