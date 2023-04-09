var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET application form page. */
router.get('/', function (req, res, next) {
    res.render('ApplicationForm', {});
});

/* POST application form page. */
router.post('/', function (req, res, next) {
    // Gather the info for the person table (student person)
    const fname = req.body.applicantFirstName;
    const lname = req.body.applicantLastName;

    // Submit the student person
    var sql = "CALL create_person ('" + fname + "', '" + lname + "', @personID); SELECT @personID;";
    var applicantID;
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        console.log("application.js: Obtained result from person table below");
        console.log(results);
        
        console.log(results[1]);
        console.log(results[1][0]);
        console.log(results[1][0]['@personID']);
        applicantID = results[1][0]['@personID'];
        if (applicantID === undefined || applicantID == 0) {
            console.log("application.js: No ID returned");
        }
        else {
            console.log("application.js: personID = " + applicantID);
            createApplication(applicantID, req)
        }
    });
});

function createApplication(applicantID, req){
    // Gather info for the application table
    const schoolLevel = req.body.applicantSchoolLevel;
    const dateOfBirth = req.body.applicantDoB;
    const latitude = req.body.applicantLatitude;
    const longitude = req.body.applicantLongitude;
    const transportation_assistance = (req.body.transportAssistRadio=='false'?0:1);
    const meal_assistance = (req.body.mealAssistRadio=='false'?0:1);
    const essayAnswer = req.body.applicantShortEssay;

    // Submit application info
    var sql = "CALL create_application (?,?,?,?,?,?,?,?);";
    var applicantID;
    dbCon.query(sql,[applicantID, schoolLevel, dateOfBirth, latitude, longitude, transportation_assistance, meal_assistance, essayAnswer], function(err, results) {
        if (err) {
            throw err;
        }
        console.log("application.js: Inserted an application");
    });
    // Create a person and submit for each guardian
    // res.redirect('/');

    // Fix valid GPA values
}

module.exports = router;