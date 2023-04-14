var express = require('express');
var router = express.Router();

var dbCon = require("../lib/database");


/* GET new course page. */
router.get('/', function (req, res, next) {
    let obj = new Object();

    getNewCoursePart1(req, res, obj);
});

// Load the semesters
function getNewCoursePart1(req, res, obj){
    const sql = "CALL `get_semesters`();";
    dbCon.query(sql, function (err, results) {
        if (err) {
          throw err;
        }

        let semesters = new Array();
        results[0].forEach(element => {
            semesters.push(
                {...element}
            );
        });
        obj.semesters = semesters;

        getNewCoursePart2(req, res, obj);
    });
}

// Load the classes
function getNewCoursePart2(req, res, obj){
    const sql = "CALL `get_classes`();";
    dbCon.query(sql, function (err, results) {
        if (err) {
          throw err;
        }

        let classes = new Array();
        results[0].forEach(element => {
            classes.push(
                {...element}
            );
        });
        obj.classes = classes;

        getNewCoursePart3(req, res, obj);
    });
}

// Get the days of week
function getNewCoursePart3(req, res, obj){
    const sql = "CALL `get_day_of_weeks`();";
    dbCon.query(sql, function (err, results) {
        if (err) {
          throw err;
        }

        let days = new Array();
        results[0].forEach(element => {
            days.push(
                {...element}
            );
        });
        obj.days = days;
        // The spread operator ... puts all the values in like "semesters: obj.semesters" so I dont have to do it manualy
        res.render('NewCourse', {...obj});
    });
}


/* GET new course page. */
router.post('/', function (req, res, next) {
    let obj = new Object();
    postNewCoursePart1(req, res, obj);
});

// Create the new class
function postNewCoursePart1(req, res, obj){
    const sql = "CALL `create_class`(?,?,?,@new_class_id); SELECT @new_class_id;";
    dbCon.query(sql, [req.body.classSemester, req.body.classSubject, req.body.classLevel], function (err, results) {
        if (err) {
          throw err;
        }

    
        console.debug(`CALL \`create_class\`(${req.body.classSemester}, ${req.body.classSubject}, ${req.body.classLevel}, @new_class_id);`);
        obj.new_class_id = results[1][0]["@new_class_id"];
        postNewCoursePart2(req, res, obj);
    });
}


// Create the new class times
function postNewCoursePart2(req, res, obj){
    // Loops through the meetings / tables
    for (let i = 0; req.body["meeting[" + i + "][day]"] != undefined; i++) {
        console.log("Meeting:");
        console.log(req.body["meeting[" + i + "][day]"]);

        // Loops throug the groups / rows
        for (let j = 0; req.body["meeting[" + i + "][day]"][j] != undefined; j++) {
            console.log("Parts:");
            let day;
            let start;
            let end;

            // Check if values are arrays
            if(Array.isArray(req.body["meeting[" + i + "][day]"])){
                day = req.body["meeting[" + i + "][day]"][j];
            }
            else{
                day = req.body["meeting[" + i + "][day]"];
            }

            if(Array.isArray(req.body["meeting[" + i + "][start]"])){
                start = req.body["meeting[" + i + "][start]"][j];
            }
            else{
                start = req.body["meeting[" + i + "][start]"];
            }

            if(Array.isArray(end = req.body["meeting[" + i + "][end]"])){
                end = req.body["meeting[" + i + "][end]"][j];
            }
            else{
                end = req.body["meeting[" + i + "][end]"];
            }


            let sql = "CALL create_class_time(?,?,?,?,?)";
            dbCon.query(sql, [obj.new_class_id, day, i, start, end], function (err, results) {
                if (err) {
                  throw err;
                }
                console.debug(`CALL \`create_class_time\`(${obj.new_class_id}, ${day}, ${i}, ${start}, ${end});`);
            });
        }
    }
    postNewCoursePart3(req, res, obj);
}

// Assign the instructor to the new class
function postNewCoursePart3(req, res, obj){
    let sql = "CALL create_instructor_schedule(?,?)";
    dbCon.query(sql, [req.session.emailAddress, obj.new_class_id], function (err, results) {
        if (err) {
          throw err;
        }

        console.debug(`CALL \`create_instructor_schedule\`(${req.session.emailAddress}, ${obj.new_class_id});`);

        res.redirect("/");
    });
}

module.exports = router;