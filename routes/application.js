var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET application form page. */
router.get('/', function (req, res, next) {
    var sql = "SELECT `public_school_level_id`, `level` FROM `public_school_level`;";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        let levels = results;
        res.render('ApplicationForm', {levels: levels});
    });
});

/* POST application form page. */
router.post('/', function (req, res, next) {
    // Gather the info for the person table (student person)
    const fname = req.body.applicantFirstName;
    const lname = req.body.applicantLastName;
    const email = req.body.applicantEmail;
    const phone = req.body.applicantPhone;

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
            // Create their contact info
            if (email != '') generateContact(email, 2, applicantID);
            if (phone != '') generateContact(phone, 1, applicantID);

            createApplication(applicantID, req, res)
        }
    });
});

function createApplication(guardianID, req, res){
    // Gather info for the application table
    const schoolLevel = req.body.applicantSchoolLevel;
    const dateOfBirth = req.body.applicantDoB;
    const latitude = req.body.applicantLatitude;
    const longitude = req.body.applicantLongitude;
    const transportation_assistance = (req.body.transportAssistRadio=='false'?0:1);
    const meal_assistance = (req.body.mealAssistRadio=='false'?0:1);
    const essayAnswer = req.body.applicantShortEssay;

    // Submit application info
    var sql = "CALL create_application (?,?,?,?,?,?,?,?, @applicationID); SELECT @applicationID;";
    dbCon.query(sql,[guardianID, schoolLevel, dateOfBirth, latitude, longitude, transportation_assistance, meal_assistance, essayAnswer], function(err, results) {
        if (err) {
            throw err;
        }
        console.log("application.js: inserted an application");
        console.log(results);
        
        console.log(results[1]);
        console.log(results[1][0]);
        console.log(results[1][0]['@applicationID']);
        applicationID = results[1][0]['@applicationID'];
        if (applicationID === undefined || applicationID == 0) {
            console.log("application.js: No ID returned");
        }
        else {
            console.log("application.js: personID = " + applicationID);

            createGuardianPerson(applicationID, req, res)
        }
    });

    
}

function createGuardianPerson(applicationID, req, res){
    // Create a person and submit for each guardian
    var totalGuardians = req.body.totalGuardians;

    for (var i = 1; i <= totalGuardians; i++){
        var guardianName = req.body['guardianName'+i];
        var guardianIncome = req.body['guardianIncome'+i];
        var guardianEmail = req.body['guardianPhone'+i];
        var guardianPhone = req.body['guardianEmail'+i];

        var fname = guardianName.substring(0, guardianName.indexOf(' '));
        var lname = guardianName.substring(guardianName.indexOf(' ') + 1);

        // Create the person for the guardian
        var sql = "CALL create_person ('" + fname + "', '" + lname + "', @personID); SELECT @personID;";
        var guardianID;
        dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }
            console.log("application.js: Obtained result from person table below");
            console.log(results);
            
            console.log(results[1]);
            console.log(results[1][0]);
            console.log(results[1][0]['@personID']);
            guardianID = results[1][0]['@personID'];
            if (guardianID === undefined || guardianID == 0) {
                console.log("application.js: No ID returned");
            }
            else {
                console.log("application.js: personID = " + guardianID);
                
                // Create their contact info
                if (guardianEmail != '') generateContact(guardianEmail, 2, guardianID);
                if (guardianPhone != '') generateContact(guardianPhone, 1, guardianID);
                generateGuardian(guardianID, applicationID, guardianIncome, res);
            }
        });

    }

    // Fix valid GPA values
}

function  generateContact(contact, contactType, guardianID){
    var sql = "CALL create_contact ('" + guardianID + "', '" + contactType + "', '" + contact + "');";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
    });
}

function generateGuardian(guardianID, applicationID, annual_income, res){
    var sql = "CALL create_guardian ('" + guardianID + "', '" + applicationID + "', '" + annual_income + "');";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
    });

    res.redirect('/');
}

module.exports = router;