var express = require('express');
var router = express.Router();

/* GET certificate page. */
router.get('/', function (req, res, next) {
    res.render('Certificate', {});
});

module.exports = router;