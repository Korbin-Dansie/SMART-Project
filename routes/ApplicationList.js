var express = require("express");
var router = express.Router();

var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("Get ApplicationList.js");
  res.render("ApplicationList", {});
});

module.exports = router;
