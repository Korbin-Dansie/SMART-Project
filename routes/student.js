var express = require('express');
var router = express.Router();

var dbCon = require("../lib/database");

/* GET student overview page. */
router.get('/', function (req, res, next) {
    var studentID = req.query.student_id;
  
    // Student Name
    // Contact info
    // Student status
    // Public school as of application
    // Transport meal assistance

    // Guardians names and income

    // All classes
    // Certificates
    // Notes


    if (studentID != undefined) {
      let sql = "CALL select_student_classes(?); CALL select_student_certificates(?);";
      dbCon.query(sql, [studentID, studentID], function (err, results) {
          if (err) {
            throw err;
          } 
  
          console.log(results);

          res.render('Student', {studentClasses: results[0], studentCertificates: results[2]});
      });
    } else {
      res.render('Student', {});
    }
});


/* Get all the student notes. */
router.get('/notes', function (req, res, next) {
    let sql = "CALL get_notes(?);";
    dbCon.query(sql, [req.query['student_id']], function (err, results) {
        if (err) {
          throw err;
        } 

        let notes = new Array();
        results[0].forEach((element) => {
          notes.push({ ...element });
        });
        return res.send(Object.values(notes));
    });
});


/* Post student overview page. */
router.post('/insertNote', function (req, res, next) {

    let obj = new Object();
    let student_id = req.body['student_id'];
    let note = req.body['newNote'];
    let date = req.body['new-note-date'];
    const emailAddress = req.session.emailAddress;

    // Get the user id from their session token
    let sql = "CALL `get_userid_from_email`(?, @userId); SELECT @userId;";
    dbCon.query(sql, [emailAddress], function (err, results) {
      if (err) {
        throw err;
      }   
      
      // Store the information in the object
      obj.student_id = student_id;
      obj.date = date;
      obj.note = note;
      obj.user_id = results[1][0]['@userId'];

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
    let sql = "CALL get_social_worker_student_id(?,?, @social_worker_student_id); SELECT @social_worker_student_id;"
    dbCon.query(sql, [obj.user_id, obj.student_id], function (err, results) {
        if (err) {
          throw err;
        }   
        obj.social_worker_student_id = results[1][0]['@social_worker_student_id'];
        addNoteStep2(req, res, obj);
      });
}


// Now the we have the socail_worker_student id insert the note
function addNoteStep2(req, res, obj){
    //add_new_note
    let sql = "CALL add_new_note(?,?,?);"
    dbCon.query(sql, [ obj.social_worker_student_id, obj.date, obj.note], function (err, results) {
        if (err) {
          throw err;
        }   
        returnToStudentPage(req, res, obj);
    });
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