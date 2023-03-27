var express = require('express');
var router = express.Router();

/* GET course overview page. */
router.get('/', function (req, res, next) {
    res.render('Course', {});
});

module.exports = router;