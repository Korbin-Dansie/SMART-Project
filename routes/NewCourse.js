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

    // https://www.freecodecamp.org/news/build-dynamic-forms-in-react/
    // https://www.geeksforgeeks.org/how-to-get-values-from-html-input-array-using-javascript/
    console.log(req.body);

    let class_times = new Array();
    console.log(req.body['meeting']);

    console.log("Test Loop");

    let string = ""
    for (let i = 0; req.body["meeting[" + i + "][day]"] != undefined; i++) {
        console.log("Meeting:");
        console.log(req.body["meeting[" + i + "][day]"]);

        for (let j = 0; req.body["meeting[" + i + "][day]"][j] != undefined; j++) {
            console.log("Parts:");
            const element = req.body["meeting[" + i + "][day]"][j];
            console.log(element);
        }
    }


    getNewCoursePart1(req, res, obj);
});
module.exports = router;