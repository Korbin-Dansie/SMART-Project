var express = require('express');
var router = express.Router();

/* GET new assignment page. */
router.get('/', function (req, res, next) {
    res.render('NewAssignment', {});
});

module.exports = router;