var express = require('express');
var router = express.Router();

var dbCon = require("../lib/database");

/* GET student overview page. */
router.get('/', function (req, res, next) {
    res.render('Student', {});
});


/* Post student overview page. */
router.post('/insertNote', function (req, res, next) {

    let obj = new Object();
    let student_id = req.body['student_id'];
    const emailAddress = req.session.emailAddress;

    // Get the user id from their session token
    let sql = "CALL `get_userid_from_email`(?, @userId); SELECT @userId;";
    dbCon.query(sql, [emailAddress], function (err, results) {
      if (err) {
        throw err;
      }   
      
      // Store the information in the object
      obj.student_id = student_id;

      obj.user_id = results[1][0];

      // If user is not logged in while making this request return to the student page
      if(obj.user_id == null || obj.user_id == undefined){
        returnToStudentPage(req, res, obj);
      }else{
        addNoteStep1(req, res, obj);
      }
    });
});

// Now that we have the userId and the student Id find the socail_worker_student id
function addNoteStep1(req, res, obj){
    addNoteStep2(req, res, obj);
}


// Now the we have the socail_worker_student id insert the note
function addNoteStep2(req, res, obj){
    returnToStudentPage(req, res, obj);
}

function returnToStudentPage(req, res, obj){
    // Return to the student page
    let params = new URLSearchParams();
    params.append("student_id", obj.student_id);
    return res.redirect(
      req.baseUrl + "?" + encodeURI(params.toString())
    );
}
module.exports = router;