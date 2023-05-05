var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET student overview page. */
router.get('/', function (req, res, next) {
    var studentID = req.query.student_id;
  
    var sql = "CALL `select_student_info` (?, @student_first_name, @student_last_name, @student_status, @student_birthdate, @student_application_meal_assistance, @student_application_transport_assistance, @student_application_latitude, @student_application_longitude); "
         + "SELECT @student_first_name, @student_last_name, @student_status, @student_birthdate, @student_application_meal_assistance, @student_application_transport_assistance, @student_application_latitude, @student_application_longitude;";
    
    dbCon.query(sql, [studentID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);
      //set the variables for the student
      var studentPageVariables = {};
      studentPageVariables.studentName = results[1][0]['@student_first_name'] + " " + results[1][0]['@student_last_name'];
      studentPageVariables.studentStatus = results[1][0]['@student_status'];
      studentPageVariables.studentBirthdate = results[1][0]['@student_birthdate'];
      studentPageVariables.mealAssistance = results[1][0]['@student_application_meal_assistance'];
      studentPageVariables.transportAssistance = results[1][0]['@student_application_transport_assistance'];
      studentPageVariables.latitude = results[1][0]['@student_application_latitude'];
      studentPageVariables.longitude = results[1][0]['@student_application_longitude'];
      
      console.log("Student Page Variables Step 1:");
      console.log(studentPageVariables);

      GETPart2(studentPageVariables, studentID, res);

    });
    // TODO: All certificates
    // Notes are done by ajax
});

function GETPart2(studentPageVariables, studentID, res) {
  // Contact info
  var sql = "SELECT contact_type.`type`, contact_information.`value` \n" +
  "FROM application\n" +
  "LEFT JOIN person ON application.person_id = person.person_id\n" +
  "LEFT JOIN contact_information ON contact_information.person_id = person.person_id\n" +
  "LEFT JOIN contact_type ON contact_type.contact_type_id = contact_information.contact_type_id\n" +
  "WHERE application.student_id = (?);";
    
    dbCon.query(sql, [studentID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);
      //set the variables for the student
      studentPageVariables.contact = [];

      for (var i = 0; i < results.length; i ++) {
        studentPageVariables.contact.push(results[i]['value']);
      }

      console.log("Student Page Variables Step 2:");
      console.log(studentPageVariables);

      GETPart3(studentPageVariables, studentID, res);

    });
}

function GETPart3(studentPageVariables, studentID, res) {
  // Guardians names and income
  var sql = "CALL `select_student_guardians`(?);";
    
    dbCon.query(sql, [studentID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);

      studentPageVariables.parents = [];
      
      for (var i = 0; i < results[0].length; i ++) {
        studentPageVariables.parents.push({
          parentName: (results[0][i]['first_name'] + " " + results[0][i]['last_name']),
          parentIncome: results[0][i]['annual_income']});
      }

      console.log("Student Page Variables Step 3:");
      console.log(studentPageVariables);

      GETPart4(studentPageVariables, studentID, res);

    });
}

function GETPart4(studentPageVariables, studentID, res) {
  // All classes
  var sql = "CALL `select_student_classes`(?); CALL select_student_certificates(?);";
    
    dbCon.query(sql, [studentID, studentID], function (err, results) {
      if (err) {
        throw err;
      }

      console.log(results);

      studentPageVariables.courses = [];
      studentPageVariables.certificates = [];
      
      for (var i = 0; i < results[0].length; i ++) {
        studentPageVariables.courses.push({
          courseSubject: (results[0][i]['subject_name'] + " " + results[0][i]['level_name']),
          courseSemester: results[0][i]['description']});
      }
      
      for (var i = 0; i < results[2].length; i ++) {
        studentPageVariables.certificates.push({
          certificateSubject: (results[2][i]['name']),
          certificateDate: results[2][i]['date_awarded']});
      }

      console.log("Student Page Variables Step 4:");
      console.log(studentPageVariables);

  
      res.render('Student', {vars: studentPageVariables});

    });
}

//=============================================================================================================


/* Get all the student notes. */
router.get("/notes", function (req, res, next) {
  let sql = "CALL get_notes(?);";
  dbCon.query(sql, [req.query["student_id"]], function (err, results) {
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
router.post("/insertNote", function (req, res, next) {
  let obj = new Object();
  let student_id = req.body["student_id"];
  let note = req.body["newNote"];
  let date = req.body["new-note-date"];
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
    obj.user_id = results[1][0]["@userId"];

    // If user is not logged in while making this request return to the student page
    if (obj.user_id == null || obj.user_id == undefined) {
      returnToStudentPage(req, res, obj);
    } else {
      addNoteStep1(req, res, obj);
    }
  });
});

// Now that we have the userId and the student Id find the social_worker_student id
function addNoteStep1(req, res, obj) {
  let sql =
    "CALL get_social_worker_student_id(?,?, @social_worker_student_id); SELECT @social_worker_student_id;";
  dbCon.query(sql, [obj.user_id, obj.student_id], function (err, results) {
    if (err) {
      throw err;
    }
    obj.social_worker_student_id = results[1][0]["@social_worker_student_id"];
    addNoteStep2(req, res, obj);
  });
}

// Now the we have the socail_worker_student id insert the note
function addNoteStep2(req, res, obj) {
  //add_new_note
  let sql = "CALL add_new_note(?,?,?);";
  dbCon.query(
    sql,
    [obj.social_worker_student_id, obj.date, obj.note],
    function (err, results) {
      if (err) {
        throw err;
      }
      returnToStudentPage(req, res, obj);
    }
  );
}

// /student/editNote
/** Edit a students note */
router.post("/editNote", function (req, res, next) {
  let obj = new Object();
  let student_id = req.body["student_id"];
  obj.student_id = student_id;

  let note_id = req.body["noteId"];
  let note = req.body["newNote"];
  let date = req.body["new-note-date"];

  // If delete is sent then delte the note, else just update it
  let delete_note = req.body["delete"];


  if (delete_note != undefined) {
    let sql = "CALL delete_note(?);";
    dbCon.query(sql, [note_id], function (err, results) {
      if (err) {
        throw err;
      }
      returnToStudentPage(req, res, obj);
    });
  } else {
    let sql = "CALL edit_note(?,?,?);";
    dbCon.query(sql, [note_id, date, note], function (err, results) {
      if (err) {
        throw err;
      }
      returnToStudentPage(req, res, obj);
    });
  }

  // // Get the user id from their session token
  // let sql = "CALL `get_userid_from_email`(?, @userId); SELECT @userId;";
  // dbCon.query(sql, [emailAddress], function (err, results) {
  //   if (err) {
  //     throw err;
  //   }

  // });

});

function returnToStudentPage(req, res, obj) {
  // Return to the student page
  let params = new URLSearchParams();
  params.append("student_id", obj.student_id);
  return res.redirect(req.baseUrl + "?" + encodeURI(params.toString()));
}
module.exports = router;
