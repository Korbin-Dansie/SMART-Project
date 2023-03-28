var express = require('express');
var router = express.Router();

/* GET application form page. */
router.get('/', function (req, res, next) {

    var person1 = {name: "Jane Doe", age: 14, grade: 8, date_of_application: (new Date(2023, 3, 27)).toLocaleDateString('en-US')};
    var person2 = {name: "Peter Tamiko", age: 15, grade: 7, date_of_application: (new Date(2023, 2, 16)).toLocaleDateString('en-US')};
    var person3 = {name: "Jase Mathew", age: 14, grade: 8, date_of_application: (new Date(2023, 2, 11)).toLocaleDateString('en-US')};

    let applications = [person1, person2, person3];
    res.render('AdminDashboard', {applications: applications});
});

module.exports = router;