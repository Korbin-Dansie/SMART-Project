var express = require('express');
var router = express.Router();

/* GET application form page. */
router.get('/', function (req, res, next) {
    res.render('ApplicationForm', {});
});

module.exports = router;