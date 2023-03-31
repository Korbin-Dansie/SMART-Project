var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("Get ApplicationList.js");
  var person1 = {name: "Jane Doe", age: 14, grade: 8, date_of_application: (new Date(2023, 3, 27)).toLocaleDateString('en-US'), application_status:"Active", application_id:1};
  var person2 = {name: "Peter Tamiko", age: 15, grade: 7, date_of_application: (new Date(2023, 2, 16)).toLocaleDateString('en-US'), application_status:"Wait listed", application_id:2};
  var person3 = {name: "Jase Mathew", age: 14, grade: 8, date_of_application: (new Date(2023, 2, 11)).toLocaleDateString('en-US'), application_status:"Rejected", application_id:3};

  let applications = [person1, person2, person3];

  res.render("ApplicationList", {applications: applications});
});

module.exports = router;
