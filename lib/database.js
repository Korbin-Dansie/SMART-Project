let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true // Needed for stored proecures with OUT results
});

con.connect(function (err) {
  if (err) {
    throw err;
  } else {
    console.log("database.js: Connected to server!");

    //TODO: delete after testing. Drop database when ran
    con.query("DROP DATABASE IF EXISTS smart_project");


    con.query("CREATE DATABASE IF NOT EXISTS smart_project", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: smart_project database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
  let sql = "USE smart_project";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Selected smart_project database\n\n");
      createTables();
      createStoredProcedures();
      createTriggers();
      addTableData();
    }
  });
}


function createTables() {
  // A CREATE TABLE call will work if it does not exist or if it does exist.

  let sql = "CREATE TABLE `test` (\n" +
  "  `test_id` int NOT NULL AUTO_INCREMENT,\n" +
  "  `some_text` varchar(255) DEFAULT NULL,\n" +
  "  PRIMARY KEY (`test_id`)\n" +
  ")";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table test created if it didn't exist");
    }
  });


} // end of createTables()

function createStoredProcedures() {
  
} // end of createStoredProcedures()

function createTriggers(){

}// end of createTriggers()

function addTableData() {


  let sql = "INSERT INTO `smart_project`.`test`(`some_text`) VALUES ('Happy');";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: added added 'Happy' to test");
  });

} // end of addTableData()

module.exports = con;