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

  runSQL("CREATE TABLE IF NOT EXISTS user (\n" +
          "user_id MEDIUMINT PRIMARY KEY AUTO_INCREMENT,\n" +
            "account_type_id TINYINT,\n" + // NEED TO MAKE THIS A FOREIGN KEY
            "person_id MEDIUMINT,\n" + // NEED TO MAKE THIS A FOREIGN KEY
            "salt CHAR(16),\n" +
            "hashed_password CHAR(64),\n" +
            "email VARCHAR(255),\n" +
            "is_active BOOLEAN\n" +
          ");");


} // end of createTables()

function createStoredProcedures() {
  runSQL("CREATE PROCEDURE IF NOT EXISTS `get_salt` ( \n" +
          "IN email VARCHAR(255), \n" +
          "OUT salt CHAR(16) \n" +
        ") \n" +
        "BEGIN \n" +
          "SELECT user.salt INTO salt FROM user \n" +
          "WHERE user.email = email AND user.is_active = TRUE; \n" +
        "END;",
        "Procedure get_salt created if it didn't already exist.");


  runSQL("CREATE PROCEDURE IF NOT EXISTS `login_user` ( \n" +
          "IN email VARCHAR(255), \n" +
          "IN hashed_password CHAR(64), \n" +
          "OUT account_type TINYINT \n" +
        ") \n" +
        "BEGIN \n" +
          "SELECT 0 INTO account_type; \n" +
          "SELECT user.account_type_id INTO account_type FROM user WHERE user.email = email \n" +
          "AND user.hashed_password = hashed_password; \n" + // user type 0 is invalid, bad login
        "END;",
        "Procedure login_user created if it didn't already exist.");
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

  runSQL("INSERT INTO `user` (account_type_id, person_id, salt, hashed_password, email, is_active) " + 
  "VALUES (1, 1, '7e43af8c89806bcf', '60db1f65a6617317ba485b74ac5c0ee67a80d0aef7ca531af6c7f31ac57ea7ad', 'admin@a.a', true)");

} // end of addTableData()

function runSQL (sql, printmessage){
  con.query(sql, function(err,rows){
    if (err) {
      
      console.log(err.message);
      throw err;
    }
    console.log("database.js: " + printmessage);
    console.log(rows[1]);
  });
}

module.exports = con;