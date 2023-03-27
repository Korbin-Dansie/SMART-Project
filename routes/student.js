var express = require('express');
var router = express.Router();

/* GET student overview page. */
router.get('/', function (req, res, next) {
    res.render('Student', {});
});

module.exports = router;