var express = require('express');
var router = express.Router();

/* GET student schedule page. */
router.get('/', function (req, res, next) {
    res.render('StudentSchedule', {});
});

module.exports = router;