var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');


/* GET application form page. */
router.get('/', function (req, res, next) {

    // var person1 = {name: "Jane Doe", age: 14, grade: 8, date_of_application: (new Date(2023, 3, 27)).toLocaleDateString('en-US')};
    // var person2 = {name: "Peter Tamiko", age: 15, grade: 7, date_of_application: (new Date(2023, 2, 16)).toLocaleDateString('en-US')};
    // var person3 = {name: "Jase Mathew", age: 14, grade: 8, date_of_application: (new Date(2023, 2, 11)).toLocaleDateString('en-US')};

    // let applications = [person1, person2, person3];
    
    res.render('AdminDashboard', {});
});



/* Return a list of all the classes*/ 
router.get('/classes', function(req, res, next) {
    let sql = "CALL list_all_classes();";
    dbCon.query(sql, function (err, results) {
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
module.exports = router;