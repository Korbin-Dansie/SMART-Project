var express = require('express');
var router = express.Router();

/* GET new course page. */
router.get('/', function (req, res, next) {
    res.render('NewCourse', {});
});

module.exports = router;