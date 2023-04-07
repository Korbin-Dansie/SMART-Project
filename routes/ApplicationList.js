var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

// var person1 = {name: "Jane Doe", age: 14, grade: 8, date_of_application: (new Date(2023, 3, 27)).toLocaleDateString('en-US'), application_status:"Active", application_id:1};
// var person2 = {name: "Peter Tamiko", age: 15, grade: 7, date_of_application: (new Date(2023, 2, 16)).toLocaleDateString('en-US'), application_status:"Wait Listed", application_id:2};
// var person3 = {name: "Jase Mathew", age: 14, grade: 8, date_of_application: (new Date(2023, 2, 11)).toLocaleDateString('en-US'), application_status:"Rejected", application_id:3};

// let applications = [person1, person2, person3];

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("Get ApplicationList.js");

  const sql = "CALL select_applications(NULL)";
    dbCon.query(sql, function (err, results) {
      if (err) {
        throw err;
      }
      //console.log(results);
      //console.log(results[0]);

      let applications = [];

      let recordsReturned = results[0];
      for (i = 0; i < recordsReturned.length; i++) {
        let applicationRecord = {name: recordsReturned[i]['first_name'] + ' ' + recordsReturned[i]['last_name'], age: recordsReturned[i]['date_of_birth'], grade: recordsReturned[i]['level'], date_of_application: recordsReturned[i]['date_of_application'], application_status: recordsReturned[i]['application_status'], application_id: recordsReturned[i]['application_id']};
        applications.push(applicationRecord);
      }

      res.render('ApplicationList', {applications: applications});
    });
});

router.post("/", function(req, res, next) {
  let status = req.body.applicationStatus;
  //console.log(status);

  if (req.body.applicationID === undefined) {  // Just loading the list of applications
    if (status === undefined || status == "noFilter") {
      const sql = "CALL select_applications(NULL)";
      dbCon.query(sql, function (err, results) {
        if (err) {
          throw err;
        }
        //console.log(results);
        //console.log(results[0]);
  
        let applications = [];
  
        let recordsReturned = results[0];
        for (i = 0; i < recordsReturned.length; i++) {
          let applicationRecord = {name: recordsReturned[i]['first_name'] + ' ' + recordsReturned[i]['last_name'], age: recordsReturned[i]['date_of_birth'], grade: recordsReturned[i]['level'], date_of_application: recordsReturned[i]['date_of_application'], application_status: recordsReturned[i]['application_status'], application_id: recordsReturned[i]['application_id']};
          applications.push(applicationRecord);
        }
  
        res.render('ApplicationList', {applications: applications, status: status});
      });
    } else {
      const sql = "CALL select_applications('" + status + "')";
      dbCon.query(sql, function (err, results) {
        if (err) {
          throw err;
        }
        //console.log(results);
        //console.log(results[0]);
  
        let applications = [];
  
        let recordsReturned = results[0];
        for (i = 0; i < recordsReturned.length; i++) {
          let applicationRecord = {name: recordsReturned[i]['first_name'] + ' ' + recordsReturned[i]['last_name'], age: recordsReturned[i]['date_of_birth'], grade: recordsReturned[i]['level'], date_of_application: recordsReturned[i]['date_of_application'], application_status: recordsReturned[i]['application_status'], application_id: recordsReturned[i]['application_id']};
          applications.push(applicationRecord);
        }
  
        res.render('ApplicationList', {applications: applications, status: status});
      });
    }
  } else {  // Viewing details of an application
    let dataToPass = encodeURIComponent(req.body.applicationID);
    res.redirect('/ManageApplication?applicationID=' + dataToPass);
  }
  
});


module.exports = router;
