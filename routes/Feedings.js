var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");
const con = require("../lib/database");

/* GET list of students that need feeding */
router.get("/students", function (req, res, next) {
  let sql = "CALL get_students_with_meal_assistance();";
  dbCon.query(sql, function (err, results) {
    if (err) {
      throw err;
    }

    let students = new Array();
    results[0].forEach((element) => {
      students.push({ ...element });
    });
    return res.send(Object.values(students));
  });
});

/* GET list of students that are feed today */
router.get("/date", function (req, res, next) {
  let date = req.query.date;
  if (date == undefined) {
    date = null;
  }
  let sql = "CALL get_feedings(?);";
  dbCon.query(sql, [req.query.date], function (err, results) {
    if (err) {
      throw err;
    }

    // If we did not send a date return null
    if (results[0] == undefined) {
      return res.send([]);
    }

    let feedings = new Array();
    results[0].forEach((element) => {
      feedings.push({ ...element });
    });
    return res.send(Object.values(feedings));
  });
});

/* POST delete all feedings for today then reinsert them */
router.post("/insertFeedings", function (req, res, next) {
  // req.rawBody = data;
  // req.jsonBody = JSON.parse(data);
  let date = req.body["feed-date"];
  let meal = req.body["meal-time"];

  // Check if we have student ids
  // If we only have 1 id we have to treat it differnt because it is not an array.
  let studentIds = new Array();
  if (req.body["student-id"] != undefined) {
    // If it is an array set studentIds equal to id
    if (Array.isArray(req.body["student-id"])) {
      studentIds = new Array(...req.body["student-id"]);
    } else {
      studentIds = new Array(req.body["student-id"]);
    }
  }

  // Delete all feedings for the selected date, then insert any (may be zero) feedings for the selected date
  let sql = "CALL delete_feedings(?,?)";
  dbCon.query(sql, [meal, date], function (err, results) {
    if (err) {
      throw err;
    }

    // For each student Id insert it into the database
    for (let index = 0; index < studentIds.length; index++) {
      let currentStudentId = studentIds[index];
      let sql = "CALL add_feeding(?,?,?,?)";

      // Get the data from the form to tell wether the user clicked feed or not feed
      let is_done = req.body[`options-outlined[${currentStudentId}]`];

      // Now insert into the database
      dbCon.query(sql, [currentStudentId, meal, date, is_done], function (err, results) {
        if (err) {
          throw err;
        }

        // See if we are done with the for loop and it so return to the feedings page
        if(index + 1 == studentIds.length){
          let params = new URLSearchParams();
          params.append("date", date);
          params.append("mealtime", meal);
          params.append("save", 1);
  
          return res.redirect(req.baseUrl + "/?" + encodeURI(params.toString()));
        }
      }); // End of add 
    }

    // If we have no student return
    if(studentIds.length == 0){
      let params = new URLSearchParams();
      params.append("date", date);
      params.append("mealtime", meal);
      params.append("save", 1);

      return res.redirect(req.baseUrl + "/?" + encodeURI(params.toString()));}
  }); // end of delete
});

/* GET home page. */
router.get("/", function (req, res, next) {
  let obj = new Object();

  getStep1(req, res, obj);
});

// Load the meal times
function getStep1(req, res, obj) {
  let sql = "CALL `get_meal_times`()";
  dbCon.query(sql, function (err, results) {
    if (err) {
      throw err;
    }

    let meal_times = new Array();
    results[0].forEach((element) => {
      meal_times.push({ ...element });
    });

    obj.meal_times = meal_times;
    res.render("Feedings", { ...obj });
  });
}

module.exports = router;
