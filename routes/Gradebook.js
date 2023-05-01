var express = require('express');
var router = express.Router();
var app = express();

var dbCon = require('../lib/database');
var multer = require('multer');

// Taken from https://stackoverflow.com/a/39650303
// Names the file we save from the upload with the appropriate file extension
var path = require('path')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignmentAssets')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

var upload = multer({ storage: storage });

//var upload = multer({ dest: 'uploads/assignmentAssets' });

router.get('/', function (req, res, next) {
    let classID = req.query.classID;

    let sql = "CALL select_class_distinct_students(?); CALL select_class(?); CALL select_class_certified_students(?);";
    dbCon.query(sql, [classID, classID, classID], function (err, results) {
      if (err) {
        throw err;
      }
      //console.log(results);
      //console.log(results[5]);

      if (results[0].length > 0) {
        let studentAssignmentsSQL = "";

        for (let i = 0; i < results[0].length; i++) {
            studentAssignmentsSQL += "CALL select_student_assignments(" + results[0][i]['student_id'] + ", " + classID + "); ";
        }

        dbCon.query(studentAssignmentsSQL, function (err, studentAssignmentsResults) {
            if (err) {
              throw err;
            }
            //console.log(studentAssignmentsResults);

            let studentAssignments = [];
            for (let i = 0; i < studentAssignmentsResults.length; i += 2) {
                studentAssignments.push(studentAssignmentsResults[i]);
            }

            console.log(studentAssignments);

            res.render('Gradebook', {students: results[0], classDetails: results[3][0], studentAssignments: studentAssignments, certifiedStudents: results[5]});

        });
      } else {
        res.render('Gradebook', {students: results[0], classDetails: results[3][0], studentAssignments: [], certifiedStudents: []});
      }
    });
});

router.post('/', function (req, res, next) {
  //console.log(req);
  let assignmentID = req.body.studentAssignmentID;
  let assignmentGrade = req.body.assignmentGrade;
  let pointsPossible = req.body.pointsPossible;

  //console.log(assignmentID, assignmentGrade, pointsPossible);
  
  let status = 2; // Pass

  if (assignmentGrade < pointsPossible / 2) {
    status = 1; // Fail
  }
  
  let sql = "CALL update_student_assignment_grade(?, ?, ?);";
  dbCon.query(sql, [assignmentID, assignmentGrade, status], function (err, results) {
    if (err) {
      throw err;
    }
    //console.log(results);
    //console.log(results[3][0]);

    res.sendStatus(200);

  });
  
});

router.post('/upload', upload.single('myFile'), function (req, res, next) {
  console.log(req.body.studentAssignmentID);
  console.log(req.file);

  let filePath = req.file.destination;
  let fileName = req.file.filename;

  let assetSQL = "CALL save_student_assignment_asset(?, ?)";
  dbCon.query(assetSQL, [req.body.studentAssignmentID, (req.file.path)], function (err, results) {
    if (err) {
      throw err;
    }
    //console.log(results);
    //console.log(results[3][0]);

    res.sendStatus(200);
  });
});

router.get('/download', function (req, res, next) {
  console.log(req.query);

  res.download(req.query.document_path);

});

module.exports = router;