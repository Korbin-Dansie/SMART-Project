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
        console.log(classes);
        // The spread operator ... puts all the values in like "semesters: obj.semesters" so I dont have to do it manualy
        res.render('NewCourse', {...obj});
    });
}
module.exports = router;