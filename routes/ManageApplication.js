var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("Get ManageApplication.js");
  manageApplicationGetStep1(req, res);
});

function manageApplicationGetStep1(req, res, errorMessage){
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

      if (results[5].length > 0) {
        let guardianContactSQL = "";

        for (let i = 0; i < results[5].length; i++) {
          let guardianID = results[5][i]['person_id'];
          guardianContactSQL += "CALL select_person_phone(" + guardianID + "); CALL select_person_email(" + guardianID + "); ";
        }
  
        dbCon.query(guardianContactSQL, function(err, guardianContactResults) {
          if (err) {
            throw err;
          }
          console.log(guardianContactResults);
  
          let guardianContacts = [];
          for (let i = 0; i < guardianContactResults.length / 4; i++) {
  
            let guardianContactRecord = {email: guardianContactResults[i * 4][0], phone: guardianContactResults[i * 4 + 2][0]};
            guardianContacts.push(guardianContactRecord);
          }
  
          console.log(guardianContacts);
  
          if(errorMessage != undefined || errorMessage != null){
            res.render('ManageApplication', {applicationData: results[0][0], contactInfo: results[3], guardians: results[5], guardianContacts: guardianContacts, message:errorMessage});
          }
          else{
            res.render('ManageApplication', {applicationData: results[0][0], contactInfo: results[3], guardians: results[5], guardianContacts: guardianContacts});
          }
        });
      } else {
        res.render('ManageApplication', {applicationData: results[0][0], contactInfo: results[3], guardians: results[5], guardianContacts: []});
      }
    });
  } else {
    res.redirect('/');
  }
}


/* POST home page. */
router.post("/", function (req, res, next) {
  console.log("POST ManageApplication.js");

  console.log(req.query.applicationID);

  let obj = new Object;
  obj.application_id = req.query.applicationID;

  // The applicationID which is stored in the URL if the application id exists
  // Check if applicationStatus value exists then update 
  manageApplicationsStep1(req, res, obj);


});

// Check if the application id exists
function manageApplicationsStep1(req, res, obj){
  let sql = "CALL check_application_id(?, @result); SELECT @result;";
  dbCon.query(sql, [obj.application_id], function (err, results) {
    if (err) {
      throw err;
    }

    // If correct go to next step
    if(results[1][0]['@result'] == 0){
      console.log("application doesn't exist");
      manageApplicationGetStep1(req, res, "Application id does not exist");
    }
    else{
      console.log("application exists");
      manageApplicationsStep2(req, res, obj);
    }
  });
}


// Check if the application status exists and what id it is
function manageApplicationsStep2(req, res, obj){

  obj.application_status = req.body.applicationStatus;

  let sql = "CALL check_application_status(?, @result); SELECT @result;";
  dbCon.query(sql, [obj.application_status], function (err, results) {
    if (err) {
      throw err;
    }
    
    obj.application_status_id = results[1][0]['@result'];

    // If correct go to next step
    if(results[1][0]['@result'] == 0){
      manageApplicationGetStep1(req, res, "Application status does not exist");
    }
    else{
      manageApplicationStep3(req, res, obj);
    }
  });
}

// Update the applications status
// A trigger will create the student if its accepted
function manageApplicationStep3(req, res, obj){
  let sql = "CALL update_application_status(?, ?); SELECT @result;";
  dbCon.query(sql, [obj.application_id ,obj.application_status_id], function (err, results) {
    if (err) {
      throw err;
    }
    console.log(obj.application_id);
    console.log(obj.application_status_id);
    res.redirect("/applicationList");
  });
}

module.exports = router;
