var express = require('express');
var router = express.Router();

/* GET login user page. */
router.get('/', function (req, res, next) {
    res.render('LoginUser', {});
});

/* GET login password page. localhost:3000/login/password */
router.get('/password', function (req, res, next) {
    res.render('LoginPassword', {});
});

module.exports = router;