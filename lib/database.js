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
    if(process.env.DEBUG_DATABASE == "1"){
      con.query("DROP DATABASE IF EXISTS `smart_project`;", function(err, result) {
        if (err) {
          console.log(err.message);
          throw err;
        }
        console.log("database.js: Droping database `smart_project`");
        createDatabase();
      });
    }
    else{
      createDatabase();
    }


  }
});

function createDatabase(){
  con.query("CREATE DATABASE IF NOT EXISTS `smart_project`", function (err, result) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: smart_project database created if it didn't exist");
    selectDatabase();
  });
}

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
  let sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`account_type` (\n" +
  "  `account_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `account_type` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`account_type_id`))\n" +
  "COMMENT = 'admin, instructors, socail, workers, owners, and sponsors'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `account_type` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`person` (\n" +
  "  `person_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `first_name` VARCHAR(64) NOT NULL,\n" +
  "  `last_name` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`person_id`))\n" +
  "COMMENT = 'Holds first and last name'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `person` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`user` (\n" +
  "  `user_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `account_type_id` TINYINT UNSIGNED NOT NULL,\n" +
  "  `person_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `salt` CHAR(16) NOT NULL,\n" +
  "  `hashed_password` CHAR(64) NOT NULL,\n" +
  "  `email` VARCHAR(255) NOT NULL,\n" +
  "  `is_active` BOOLEAN NOT NULL DEFAULT 1,\n" +
  "  PRIMARY KEY (`user_id`),\n" +
  "  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE, \n" +
  "  INDEX `account_type_id_fk_idx` (`account_type_id` ASC) VISIBLE, \n" +
  "  CONSTRAINT `fk_user_person_id`\n" +
  "    FOREIGN KEY (`person_id`)\n" +
  "    REFERENCES `smart_project`.`person` (`person_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_user_account_type_id`\n" +
  "    FOREIGN KEY (`account_type_id`)\n" +
  "    REFERENCES `smart_project`.`account_type` (`account_type_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds login information'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `user` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`contact_type` (\n" +
  "  `contact_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `type` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`contact_type_id`))\n" +
  "COMMENT = 'Email, Phone'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `contact_type` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`contact_information` (\n" +
  "  `contact_information_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `person_id` MEDIUMINT UNSIGNED NULL,\n" +
  "  `contact_type_id` TINYINT UNSIGNED NOT NULL,\n" +
  "  `value` VARCHAR(255) NOT NULL,\n" +
  "  PRIMARY KEY (`contact_information_id`),\n" +
  "  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE,\n" +
  "  INDEX `contact_type_id_fk_idx` (`contact_type_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_contact_information_person_id`\n" +
  "    FOREIGN KEY (`person_id`)\n" +
  "    REFERENCES `smart_project`.`person` (`person_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_contact_information_contact_type_id`\n" +
  "    FOREIGN KEY (`contact_type_id`)\n" +
  "    REFERENCES `smart_project`.`contact_type` (`contact_type_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds a persons contact information'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `contact_information` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`application_status` (\n" +
  "  `application_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `application_status` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`application_status_id`))\n" +
  "COMMENT = 'Active, Waitlisted, Accepted, Rejected'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `application_status` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`public_school_level` (\n" +
  "  `public_school_level_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `level` VARCHAR(255) NOT NULL,\n" +
  "  PRIMARY KEY (`public_school_level_id`))\n" +
  "COMMENT = 'Holds their public school level. (8-12), and Adult'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `public_school_level` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_status` (\n" +
  "  `student_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_status` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`student_status_id`))\n" +
  "COMMENT = 'Active, Graduated, Removed ...'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_status` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student` (\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_status_id` TINYINT UNSIGNED NOT NULL DEFAULT 1,\n" +
  "  `date_of_admission` DATE NOT NULL DEFAULT (CURRENT_DATE),\n" +
  "  `photograph` VARCHAR(15000) NULL,\n" +
  "  PRIMARY KEY (`student_id`))\n" +
  "COMMENT = 'The main student table.'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`application` (\n" +
  "  `application_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `person_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `application_status_id` TINYINT UNSIGNED NOT NULL COMMENT 'After it is set to accepted create a new student record',\n" +
  "  `public_school_level_id` TINYINT UNSIGNED NOT NULL,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NULL,\n" +
  "  `date_of_application` DATE NOT NULL DEFAULT (CURRENT_DATE),\n" +
  "  `date_of_birth` DATE NOT NULL,\n" +
  "  `latitude` DECIMAL(11,8) NOT NULL,\n" +
  "  `longitude` DECIMAL(11,8) NOT NULL,\n" +
  "  `transportation_assistance` BOOLEAN NOT NULL DEFAULT 0,\n" +
  "  `meal_assistance` BOOLEAN NOT NULL DEFAULT 0,\n" +
  "  `essay` VARCHAR(15000) NULL,\n" +
  "  PRIMARY KEY (`application_id`),\n" +
  "  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE,\n" +
  "  INDEX `application_status_id_fk_idx` (`application_status_id` ASC) VISIBLE,\n" +
  "  INDEX `public_school_level_id_fk_idx` (`public_school_level_id` ASC) VISIBLE,\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_application_person_id`\n" +
  "    FOREIGN KEY (`person_id`)\n" +
  "    REFERENCES `smart_project`.`person` (`person_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_application_application_status_id`\n" +
  "    FOREIGN KEY (`application_status_id`)\n" +
  "    REFERENCES `smart_project`.`application_status` (`application_status_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_application_public_school_level_id`\n" +
  "    FOREIGN KEY (`public_school_level_id`)\n" +
  "    REFERENCES `smart_project`.`public_school_level` (`public_school_level_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_application_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'The students application'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `application` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`guardian` (\n" +
  "  `guardian_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `person_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `application_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `annual_income` DECIMAL(8,2) NULL,\n" +
  "  PRIMARY KEY (`guardian_id`),\n" +
  "  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE,\n" +
  "  INDEX `application_id_fk_idx` (`application_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_guardian_person_id`\n" +
  "    FOREIGN KEY (`person_id`)\n" +
  "    REFERENCES `smart_project`.`person` (`person_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_guardain_application_id`\n" +
  "    FOREIGN KEY (`application_id`)\n" +
  "    REFERENCES `smart_project`.`application` (`application_id`)\n" +
  "	ON DELETE CASCADE  \n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'To hold informa tion about an applicants parent/guardian information'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `guardian` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`social_worker_student` (\n" +
  "  `socail_worker_student_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `user_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  PRIMARY KEY (`socail_worker_student_id`),\n" +
  "  INDEX `user_id_fk_idx` (`user_id` ASC) VISIBLE,\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_social_worker_student_user_id`\n" +
  "    FOREIGN KEY (`user_id`)\n" +
  "    REFERENCES `smart_project`.`user` (`user_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE ,\n" +
  "  CONSTRAINT `fk_social_worker_student_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'For a link between socail workers and their students'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `social_worker_student` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`social_worker_student_note` (\n" +
  "  `social_worker_student_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `social_worker_student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `date_taken` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),\n" +
  "  `note` VARCHAR(15000) NOT NULL DEFAULT '',\n" +
  "  PRIMARY KEY (`social_worker_student_note_id`),\n" +
  "  INDEX `social_worker_student_id_fk_idx` (`social_worker_student_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_social_worker_student_note_social_worker_student_id`\n" +
  "    FOREIGN KEY (`social_worker_student_id`)\n" +
  "    REFERENCES `smart_project`.`social_worker_student` (`socail_worker_student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds notes about a student from a social worker'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `social_worker_student_note` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_sponsor` (\n" +
  "  `student_sponsor_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `user_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  PRIMARY KEY (`student_sponsor_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `user_id_fk_idx` (`user_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_sponsor_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_sponsor_user_id`\n" +
  "    FOREIGN KEY (`user_id`)\n" +
  "    REFERENCES `smart_project`.`user` (`user_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds the students sponsor(s)'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_sponsor` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`level` (\n" +
  "  `level_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `level_name` VARCHAR(255) NOT NULL,\n" +
  "  PRIMARY KEY (`level_id`))\n" +
  "COMMENT = 'Holds the level of the class 8-12, adult'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `level` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`subject_name` (\n" +
  "  `subject_name_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `subject_name` VARCHAR(255) NOT NULL,\n" +
  "  PRIMARY KEY (`subject_name_id`))\n" +
  "COMMENT = 'English, IT'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `subject_name` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`subject` (\n" +
  "  `subject_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `subject_name_id` SMALLINT UNSIGNED NOT NULL,\n" +
  "  `level_id` TINYINT UNSIGNED NULL,\n" +
  "  INDEX `level_id_fk_idx` (`level_id` ASC) VISIBLE,\n" +
  "  INDEX `subject_name_id_fk_idx` (`subject_name_id` ASC) VISIBLE,\n" +
  "  PRIMARY KEY (`subject_id`),\n" +
  "  CONSTRAINT `fk_subject_subject_name_id`\n" +
  "    FOREIGN KEY (`subject_name_id`)\n" +
  "    REFERENCES `smart_project`.`subject_name` (`subject_name_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "CONSTRAINT `fk_subject_level_id`\n" +
  "    FOREIGN KEY (`level_id`)\n" +
  "    REFERENCES `smart_project`.`level` (`level_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds the subjects'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `subject` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`assignment_status` (\n" +
  "  `assignment_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `status` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`assignment_status_id`))\n" +
  "COMMENT = 'pass, fail'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `assignment_status` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`semester` (\n" +
  "  `semester_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `description` VARCHAR(255) NOT NULL,\n" +
  "  `start_date` DATE NOT NULL,\n" +
  "  `end_date` DATE NOT NULL,\n" +
  "  PRIMARY KEY (`semester_id`))\n" +
  "COMMENT = 'Holds the semester fall 2022, winter 2023'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `semester` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`class` (\n" +
  "  `class_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `semester_id` SMALLINT UNSIGNED NOT NULL,\n" +
  "  `subject_id` SMALLINT UNSIGNED NOT NULL,\n" +
  "  `start_date` DATE NOT NULL COMMENT 'Gets default from semester its part of',\n" +
  "  `end_date` DATE NOT NULL COMMENT 'Gets default from semester its part of',\n" +
  "  PRIMARY KEY (`class_id`),\n" +
  "  INDEX `semester_id_fk_idx` (`semester_id` ASC) VISIBLE,\n" +
  "  INDEX `subject_id_fk_idx` (`subject_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_class_semester_id`\n" +
  "    FOREIGN KEY (`semester_id`)\n" +
  "    REFERENCES `smart_project`.`semester` (`semester_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE ,\n" +
  "  CONSTRAINT `fk_class_subject_id`\n" +
  "    FOREIGN KEY (`subject_id`)\n" +
  "    REFERENCES `smart_project`.`subject` (`subject_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `class` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`meal_time` (\n" +
  "  `meal_time_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `time` VARCHAR(255) NOT NULL,\n" +
  "  PRIMARY KEY (`meal_time_id`),\n" +
  "  UNIQUE INDEX `meal_time_id_UNIQUE` (`meal_time_id` ASC) VISIBLE)\n" +
  "COMMENT = 'Breakfast, (and/or) Lunch'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `meal_time` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`day_of_week` (\n" +
  "  `day_of_week_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `name` VARCHAR(64) NOT NULL,\n" +
  "  PRIMARY KEY (`day_of_week_id`),\n" +
  "  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)\n" +
  "COMMENT = 'Sunday, Monday, Tuesday, ...'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `day_of_week` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`certificate` (\n" +
  "  `certificate_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `name` VARCHAR(255) NOT NULL,\n" +
  "  `subject_id` SMALLINT UNSIGNED NOT NULL,\n" +
  "  PRIMARY KEY (`certificate_id`),\n" +
  "  INDEX `subject_id_fk_idx` (`subject_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_certificate_subject_id`\n" +
  "    FOREIGN KEY (`subject_id`)\n" +
  "    REFERENCES `smart_project`.`subject` (`subject_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `certificate` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_certificate` (\n" +
  "  `student_certificate_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `certificate_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `date_awarded` DATE NOT NULL,\n" +
  "  PRIMARY KEY (`student_certificate_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `certificate_id_fk_idx` (`certificate_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_certificate_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_certificate_certificate_id`\n" +
  "    FOREIGN KEY (`certificate_id`)\n" +
  "    REFERENCES `smart_project`.`certificate` (`certificate_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds certificates that a student has earned'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_certificate` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_feeding` (\n" +
  "  `student_feeding_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `meal_time_id` TINYINT UNSIGNED NOT NULL,\n" +
  "  `date_feed` DATE NOT NULL,\n" +
  "  `is_done` BOOLEAN NOT NULL DEFAULT 1,\n" +
  "  PRIMARY KEY (`student_feeding_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `meal_time_id_fk_idx` (`meal_time_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_feeding_student_id`\n" +
  "   FOREIGN KEY (`student_id`)\n" +
  "   REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "   ON DELETE CASCADE\n" +
  "   ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_feeding_meal_time_id`\n" +
  "   FOREIGN KEY (`meal_time_id`)\n" +
  "   REFERENCES `smart_project`.`meal_time` (`meal_time_id`)\n" +
  "   ON DELETE RESTRICT\n" +
  "   ON UPDATE CASCADE)\n" +
  "COMMENT = 'When a student has been feed'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_feeding` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_attendance` (\n" +
  "  `student_attendance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `class_id` INT UNSIGNED NOT NULL,\n" +
  "  `date_attended` DATE NOT NULL,\n" +
  "  `is_present` BOOLEAN NOT NULL DEFAULT 1,\n" +
  "  PRIMARY KEY (`student_attendance_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_attendance_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_attendance_class_id`\n" +
  "    FOREIGN KEY (`class_id`)\n" +
  "    REFERENCES `smart_project`.`class` (`class_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds if a student was present'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_attendance` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_public_school_schedule` (\n" +
  "  `student_public_school_schedule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `day_of_week_id` TINYINT UNSIGNED NOT NULL,\n" +
  "  `time` TIME NOT NULL,\n" +
  "  PRIMARY KEY (`student_public_school_schedule_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `day_of_week_id_fk_idx` (`day_of_week_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_public_school_schedule_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_public_school_schedule_day_of_week_id`\n" +
  "    FOREIGN KEY (`day_of_week_id`)\n" +
  "    REFERENCES `smart_project`.`day_of_week` (`day_of_week_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds a students public school schedule'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_public_school_schedule` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`assignment` (\n" +
  "  `assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `class_id` INT UNSIGNED NOT NULL,\n" +
  "  PRIMARY KEY (`assignment_id`),\n" +
  "  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_assignment_class_id`\n" +
  "    FOREIGN KEY (`class_id`)\n" +
  "    REFERENCES `smart_project`.`class` (`class_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds a classes assignments'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `assignment` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_assignment` (\n" +
  "  `student_assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `assignment_id` INT UNSIGNED NOT NULL,\n" +
  "  `assignment_status_id` TINYINT UNSIGNED NULL,\n" +
  "  `submission_date` DATE NOT NULL DEFAULT (CURRENT_DATE),\n" +
  "  `grade` DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'If the status is null then the assignment has not been graded yet',\n" +
  "  `can_sponsor_view` BOOLEAN NOT NULL DEFAULT 1,\n" +
  "  PRIMARY KEY (`student_assignment_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `assignment_id_fk_idx` (`assignment_id` ASC) VISIBLE,\n" +
  "  INDEX `assignment_status_id_fk_idx` (`assignment_status_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_assignment_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_assignment_assignment_id`\n" +
  "    FOREIGN KEY (`assignment_id`)\n" +
  "    REFERENCES `smart_project`.`assignment` (`assignment_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_assignment_assignment_status_id`\n" +
  "    FOREIGN KEY (`assignment_status_id`)\n" +
  "    REFERENCES `smart_project`.`assignment_status` (`assignment_status_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_assignment` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_assignment_document` (\n" +
  "  `student_assignment_document_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_assignment_id` INT UNSIGNED NOT NULL,\n" +
  "  `document_link` VARCHAR(15000) NOT NULL,\n" +
  "  PRIMARY KEY (`student_assignment_document_id`),\n" +
  "  INDEX `student_assignment_id_fk_idx` (`student_assignment_id` ASC) VISIBLE,\n" +
  "   CONSTRAINT `fk_student_assignment_document_student_assignment_id`\n" +
  "    FOREIGN KEY (`student_assignment_id`)\n" +
  "    REFERENCES `smart_project`.`student_assignment` (`student_assignment_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds documents that a student did on an assignment'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_assignment_document` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`assignment_note` (\n" +
  "  `assignment_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_assignment_id` INT UNSIGNED NOT NULL,\n" +
  "  `note` VARCHAR(15000) NOT NULL DEFAULT '',\n" +
  "  PRIMARY KEY (`assignment_note_id`),\n" +
  "  INDEX `student_assignment_id_fk_idx` (`student_assignment_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_assignment_note_student_assignment_id`\n" +
  "    FOREIGN KEY (`student_assignment_id`)\n" +
  "    REFERENCES `smart_project`.`student_assignment` (`student_assignment_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `assignment_note` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`class_time` (\n" +
  "  `class_time_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `class_id` INT UNSIGNED NOT NULL,\n" +
  "  `day_of_week_id` TINYINT UNSIGNED NOT NULL,\n" +
  "  `group` TINYINT NOT NULL,\n" +
  "  `start_time` TIME NULL,\n" +
  "  `end_time` TIME NULL,\n" +
  "  PRIMARY KEY (`class_time_id`),\n" +
  "  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,\n" +
  "  INDEX `day_of_week_id_fk_id` (`day_of_week_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_class_time_class_id`\n" +
  "    FOREIGN KEY (`class_id`)\n" +
  "    REFERENCES `smart_project`.`class` (`class_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_class_time_day_of_week_id`\n" +
  "    FOREIGN KEY (`day_of_week_id`)\n" +
  "    REFERENCES `smart_project`.`day_of_week` (`day_of_week_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds a double array for possible class times.So table needs to hold Mondays 7:30-9:30 OR Tuesdays 1:30-3:30  (pick one of these) AND  Wednesdays 9:30-11:30 OR Thursdays 1:30-3:30 (pick one of these). So Group 1:  Mondays 7:30-9:30 OR Tuesdays 1:30-3:30, Group 2: Wednesdays 9:30-11:30 OR Thursdays 1:30-3:30'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `class_time` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`student_schedule` (\n" +
  "  `student_schedule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `student_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `class_time_id` INT UNSIGNED NOT NULL,\n" +
  "  PRIMARY KEY (`student_schedule_id`),\n" +
  "  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,\n" +
  "  INDEX `class_time_id_fk_idx` (`class_time_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_student_schedule_student_id`\n" +
  "    FOREIGN KEY (`student_id`)\n" +
  "    REFERENCES `smart_project`.`student` (`student_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_student_schedule_class_time_id`\n" +
  "    FOREIGN KEY (`class_time_id`)\n" +
  "    REFERENCES `smart_project`.`class_time` (`class_time_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Classes a student is taking'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `student_schedule` created if it didn't exist");
      }
    });
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`instructor_schedule` (\n" +
  "  `instructor_schedule_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `user_id` MEDIUMINT UNSIGNED NOT NULL,\n" +
  "  `class_id` INT UNSIGNED NOT NULL,\n" +
  "  PRIMARY KEY (`instructor_schedule_id`),\n" +
  "  INDEX `user_id_fk_idx` (`user_id` ASC) VISIBLE,\n" +
  "  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,\n" +
  "  CONSTRAINT `fk_instructor_scheduxle_user_id`\n" +
  "    FOREIGN KEY (`user_id`)\n" +
  "    REFERENCES `smart_project`.`user` (`user_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `fk_instructor_schedule_class_id`\n" +
  "    FOREIGN KEY (`class_id`)\n" +
  "    REFERENCES `smart_project`.`class` (`class_id`)\n" +
  "    ON DELETE CASCADE\n" +
  "    ON UPDATE CASCADE)\n" +
  "COMMENT = 'Holds which instructors goes to which classes'";
  con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table `instructor_schedule` created if it didn't exist");
      }
    });  
} // end of createTables()

function createStoredProcedures() {
  runSQL("CREATE PROCEDURE IF NOT EXISTS `get_salt` ( \n" + 
  " IN email VARCHAR(255), \n" + 
  " OUT salt CHAR(16) \n" + 
  ") \n" + 
  "BEGIN \n" + 
  " SELECT user.salt INTO salt FROM user \n" + 
  " WHERE user.email = email AND user.is_active = TRUE; \n" + 
  "END;",
  "Procedure get_salt created if it didn't already exist.");
  
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `login_user` ( \n" + 
  " IN email VARCHAR(255), \n" + 
  " IN hashed_password CHAR(64), \n" + 
  " OUT account_type TINYINT \n" + 
  ") \n" + 
  "BEGIN \n" + 
  " SELECT 0 INTO account_type; \n" + 
  " SELECT user.account_type_id INTO account_type FROM user WHERE user.email = email \n" + 
  " AND user.hashed_password = hashed_password; \n" + // user type 0 is invalid, bad login
  "END;",
  "Procedure login_user created if it didn't already exist.");
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `get_userid_from_email` ( \n" + 
  " IN email VARCHAR(255), \n" + 
  " OUT userID TINYINT \n" + 
  ") \n" + 
  "BEGIN \n" + 
  " SET userID = (SELECT user_id FROM user WHERE email = email); \n" + 
  "END;",
  "Procedure get_userid_from_email created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_account_type`(\n" + 
  "IN  accountType VARCHAR(45)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " INSERT INTO account_type(account_type)\n" + 
  " VALUES (accountType);\n" + 
  "END;",
  "Procedure create_account_type created if it didn't already exist.");
  
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_person`(\n" + 
  " IN  firstName VARCHAR(45),\n" + 
  " IN  lastName VARCHAR(45),\n" + 
  " OUT id INT\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " INSERT INTO person(first_name, last_name)\n" + 
  " VALUES (firstName, lastName);\n" + 
  " \n" + 
  " SET id = LAST_INSERT_ID();\n" + 
  "END;",
  "Procedure create_person created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_user`(\n" + 
  " IN  accountType VARCHAR(45),\n" + 
  " IN  firstName VARCHAR(45),\n" + 
  " IN  lastName VARCHAR(45),\n" + 
  " IN  email VARCHAR(45),\n" + 
  " IN  hashed_password VARCHAR(255),\n" + 
  " IN  salt VARCHAR(255),\n" + 
  " OUT result INT\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " DECLARE nCount INT DEFAULT 0;\n" + 
  " SET result = 0;\n" + 
  " \n" + 
  " CALL create_person(firstName, lastName, @personID);\n" + 
  " \n" + 
  " SELECT Count(*) INTO nCount FROM user WHERE user.email = email;\n" + 
  " IF nCount = 0 THEN\n" + 
  "  INSERT INTO user(account_type_id, person_id, salt, hashed_password, email, is_active)\n" + 
  "  VALUES ((SELECT account_type_id FROM account_type WHERE account_type = accountType), @personID, salt, hashed_password, email, true);\n" + 
  " ELSE\n" + 
  "  SET result = 1;\n" + 
  " END IF;\n" + 
  "END;",
  "Procedure create_user created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `select_applications`(\n" + 
  " IN  applicationStatus VARCHAR(45)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " IF applicationStatus IS NOT NULL THEN\n" + 
  "  SELECT application_id, person.first_name, person.last_name, public_school_level.level, date_of_birth, date_of_application, application_status.application_status\n" + 
  "  FROM application\n" + 
  "  JOIN person ON person.person_id = application.person_id\n" + 
  "  JOIN application_status ON application_status.application_status_id = application.application_status_id\n" + 
  "  JOIN public_school_level ON public_school_level.public_school_level_id = application.public_school_level_id\n" + 
  "  WHERE application_status.application_status = applicationStatus;\n" + 
  " ELSE\n" + 
  "  SELECT application_id, person.first_name, person.last_name, public_school_level.level, date_of_birth, date_of_application, application_status.application_status\n" + 
  "  FROM application\n" + 
  "  JOIN person ON person.person_id = application.person_id\n" + 
  "  JOIN application_status ON application_status.application_status_id = application.application_status_id\n" + 
  "  JOIN public_school_level ON public_school_level.public_school_level_id = application.public_school_level_id;\n" + 
  " END IF;\n" + 
  "END;",
  "Procedure select_applications created if it didn't already exist.");
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `select_application_details`(\n" + 
  " IN  applicationID MEDIUMINT\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " SELECT person.first_name, person.last_name, date_of_birth, latitude, longitude, public_school_level.level, " +
  " date_of_application, transportation_assistance, meal_assistance, essay, application_status.application_status\n" + 
  " FROM application\n" + 
  " JOIN person ON person.person_id = application.person_id\n" + 
  " JOIN application_status on application_status.application_status_id = application.application_status_id\n" + 
  " JOIN public_school_level ON public_school_level.public_school_level_id = application.public_school_level_id\n" +
  " WHERE application_id = applicationID;\n" +
  "END;",
  "Procedure select_application_details created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `select_contact_info`(\n" + 
  " IN  personID MEDIUMINT\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " SELECT contact_type.type, value\n" + 
  " FROM contact_information\n" + 
  " JOIN contact_type ON contact_type.contact_type_id = contact_information.contact_type_id\n" + 
  " WHERE person_id = personID;\n" + 
  "END;",
  "Procedure select_contact_info created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `get_personid_from_applicationid`(\n" + 
  " IN  applicationID MEDIUMINT,\n" +
  " OUT personID MEDIUMINT\n" +
  ")\n" + 
  "BEGIN\n" + 
  " SET personID =\n" +
  " (SELECT person_id\n" +
  " FROM application\n" +
  " WHERE application_id = applicationID);\n" +
  "END;",
  "Procedure select_contact_info created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `select_guardians`(\n" + 
  " IN  applicationID MEDIUMINT\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " SELECT guardian.person_id, person.first_name, person.last_name, annual_income\n" +
  " FROM guardian\n" + 
  " JOIN person ON person.person_id = guardian.person_id\n" + 
  " WHERE application_id = applicationID;\n" +
  "END;",
  "Procedure select_guardians created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_application_status`(\n" + 
  " IN  applicationStatus VARCHAR(45)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  " INSERT INTO application_status(application_status)\n" + 
  " VALUES(applicationStatus);\n" + 
  "END;",
  "Procedure create_application_status created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_public_school_level`(\n" + 
  " IN public_school_level_name VARCHAR(255)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `public_school_level`\n" + 
  "	(`level`)\n" + 
  "	VALUES\n" + 
  "	(public_school_level_name);\n" + 
  "END;",
  "Procedure create_public_school_level created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_student_status`(\n" + 
  " IN student_status VARCHAR(64)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "INSERT INTO `student_status`\n" + 
  "	(`student_status`)\n" + 
  "	VALUES\n" + 
  "	(student_status);\n" + 
  "END;",
  "Procedure create_student_status created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_contact_type`(\n" + 
  " IN contact_type VARCHAR(64)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `contact_type`\n" + 
  "	(`type`)\n" + 
  "	VALUES\n" + 
  "	(contact_type);\n" + 
  "END;",
  "Procedure create_contact_type created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_day_of_week`(\n" + 
  " IN day_of_week VARCHAR(64)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `day_of_week`\n" + 
  "	(`name`)\n" + 
  "	VALUES\n" + 
  "	(day_of_week);\n" + 
  "END;",
  "Procedure create_day_of_week created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_meal_time`(\n" + 
  " IN meal_time VARCHAR(255)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `meal_time`\n" + 
  "	(`time`)\n" + 
  "	VALUES\n" + 
  "	(meal_time);\n" + 
  "END;",
  "Procedure create_day_of_week created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_assignment_status`(\n" + 
  " IN assignment_status VARCHAR(64)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `assignment_status`\n" + 
  "	(`status`)\n" + 
  "	VALUES\n" + 
  "	(assignment_status);\n" + 
  "END;",
  "Procedure create_assignment_status created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_semester`(\n" + 
  " IN semester_description VARCHAR(255),\n" + 
  " IN start_date DATE,\n" + 
  " IN end_date DATE\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `semester`\n" + 
  "	(`description`,\n" + 
  "	`start_date`,\n" + 
  "	`end_date`)\n" + 
  "	VALUES\n" + 
  "	(semester_description,\n" + 
  "	start_date,\n" + 
  "	end_date);\n" + 
  "END;",
  "Procedure create_semester created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_subject`(\n" + 
  " IN subject_name_id SMALLINT UNSIGNED,\n" + 
  " IN level_id TINYINT UNSIGNED\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `smart_project`.`subject`\n" + 
  "	(`subject_name_id`,\n" + 
  "    `level_id`)\n" + 
  "	VALUES\n" + 
  "	(subject_name_id,\n" + 
  "	level_id);\n" + 
  "END;",
  "Procedure create_subject created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_level`(\n" + 
  " IN level_name VARCHAR(255)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `level`\n" + 
  "	(`level_name`)\n" + 
  "	VALUES\n" + 
  "	(level_name);\n" + 
  "END;",
  "Procedure create_level created if it didn't already exist.");


  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_subject_name`(\n" + 
  " IN subject_name VARCHAR(255)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `subject_name`\n" + 
  "	(`subject_name`)\n" + 
  "	VALUES\n" + 
  "	(subject_name);\n" + 
  "END;",
  "Procedure create_level created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_application`(\n" + 
  " IN person_id MEDIUMINT, \n" + 
  " IN public_school_level_id TINYINT, \n" + 
  " IN date_of_birth DATE, \n" + 
  " IN latitude DECIMAL(11,8), \n" + 
  " IN longitude DECIMAL(11,8), \n" + 
  " IN transportation_assistance BOOLEAN, \n" + 
  " IN meal_assistance BOOLEAN, \n" + 
  " IN essay VARCHAR(15000), \n" + 
  " OUT id INT\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `application`\n" + 
  "	(`person_id`, `application_status_id`, `public_school_level_id`, `date_of_birth`, `latitude`, `longitude`, \n" + 
  "	    `transportation_assistance`, `meal_assistance`, `essay`)\n" + 
  "	VALUES\n" + 
  "	(person_id, 1, public_school_level_id, date_of_birth, latitude, longitude, \n" + 
  "	    transportation_assistance, meal_assistance, essay);\n" + 
  " \n" + 
  " SET id = LAST_INSERT_ID();\n" + 
  "END;",
  "Procedure create_application created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_contact`(\n" + 
  " IN person_id MEDIUMINT, \n" + 
  " IN contact_type TINYINT, \n" + 
  " IN value VARCHAR(250)\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	INSERT INTO `contact_information`\n" + 
  "	(`person_id`, `contact_type_id`, `value`)\n" + 
  "	VALUES\n" + 
  "	(person_id, contact_type, value);\n" + 
  "END;",
  "Procedure create_contact created if it didn't already exist.");  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_guardian`(\n" + 
  " IN person_id MEDIUMINT, \n" + 
  " IN application_id MEDIUMINT, \n" + 
  " IN annual_income DECIMAL(8,2) \n" + 
  ")\n" + 
  "BEGIN\n" + 
  " INSERT INTO guardian(`person_id`, `application_id`, `annual_income`)\n" + 
  " VALUES (person_id, application_id, annual_income);\n" + 
  "END;",
  "Procedure create_guardian created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `check_application_id`(\n" + 
  " IN application_id MEDIUMINT UNSIGNED, \n" + 
  " OUT result BOOLEAN\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	SET result = (SELECT EXISTS(\n" + 
  "		SELECT * \n" + 
  "        FROM `application`\n" + 
  "        WHERE\n" + 
  "        application.`application_id` = application_id\n" + 
  "    ));\n" + 
  "END;",
  "Procedure check_application_id created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `check_application_status`(\n" + 
  " IN application_status varchar(64), \n" + 
  " OUT application_status_id TINYINT UNSIGNED\n" + 
  ")\n" + 
  "BEGIN    \n" + 
  "	SELECT\n" + 
  "     `as`.`application_status_id`\n" + 
  "     INTO \n" + 
  "     application_status_id\n" + 
  "    FROM `application_status` AS `as`\n" + 
  "    WHERE `as`.`application_status` LIKE application_status\n" + 
  "    LIMIT 1;\n" + 
  "    \n" + 
  "	IF application_status_id IS NULL\n" + 
  "    THEN\n" + 
  "		SET application_status_id = 0;\n" + 
  "	END IF;\n" + 
  "END;",
  "Procedure check_application_status created if it didn't already exist.");
  
  
  runSQL("CREATE PROCEDURE IF NOT EXISTS `update_application_status`(\n" + 
  " IN application_id MEDIUMINT UNSIGNED,\n" + 
  " IN appliation_status_id TINYINT UNSIGNED\n" + 
  ")\n" + 
  "BEGIN\n" + 
  "	UPDATE `application`\n" + 
  "    SET `application_status_id` = appliation_status_id\n" + 
  "	WHERE `application_id` = application_id\n" + 
  "    LIMIT 1;\n" + 
  "END;",
  "Procedure update_application_status created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `select_instructor_classes`(\n" + 
  " IN instructor_id MEDIUMINT UNSIGNED\n" +
  ")\n" + 
  "BEGIN\n" + 
  "	SELECT person.first_name, person.last_name, semester.description, semester.start_date, semester.end_date, level.level_name, subject_name.subject_name, " +
  " day_of_week.name, class_time.start_time, class_time.end_time\n" +
  " FROM instructor_schedule\n" + 
  " JOIN user ON user.user_id = instructor_schedule.user_id\n" +
  " JOIN person ON person.person_id = user.person_id\n" +
  " JOIN class ON class.class_id = instructor_schedule.class_id\n" +
  " JOIN semester ON semester.semester_id = class.semester_id\n" +
  " JOIN subject ON subject.subject_id = class.subject_id\n" +
  " JOIN level ON level.level_id = subject.level_id\n" +
  " JOIN subject_name ON subject_name.subject_name_id = subject.subject_name_id\n" +
  " JOIN class_time ON class_time.class_id = class.class_id\n" +
  " JOIN day_of_week ON day_of_week.day_of_week_id = class_time.day_of_week_id\n" +
  " WHERE instructor_schedule.user_id = instructor_id;" +
  "END;",
  "Procedure update_application_status created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS select_person_phone (\n" +
  " IN person_id MEDIUMINT UNSIGNED\n" +
  ")\n" +
  "BEGIN\n" +
  " SELECT value\n" +
  " FROM contact_information\n" +
  " WHERE contact_information.person_id = person_id\n" +
  " AND contact_type_id = 1;\n" +  // 1 is the phone contact type
  "END;",
  "Procedure select_person_phone created if it didn't already exist.");

  runSQL("CREATE PROCEDURE IF NOT EXISTS select_person_email (\n" +
  " IN person_id MEDIUMINT UNSIGNED\n" +
  ")\n" +
  "BEGIN\n" +
  " SELECT value\n" +
  " FROM contact_information\n" +
  " WHERE contact_information.person_id = person_id\n" +
  " AND contact_type_id = 2;\n" +  // 2 is the email contact type
  "END;",
  "Procedure select_person_email created if it didn't already exist.");
  
} // end of createStoredProcedures()

function createTriggers(){
  runSQL("CREATE TRIGGER IF NOT EXISTS `trigger_application_status_accepted_insert`\n" + 
  " BEFORE INSERT\n" + 
  " ON `application` FOR EACH ROW\n" + 
  " BEGIN\n" + 
  " \n" + 
  "	DECLARE new_student_id MEDIUMINT UNSIGNED DEFAULT 0;\n" + 
  "	\n" + // If is is accepted create a student record, 2 =	Accepted
  "    IF(NEW.application_status_id = 2)\n" + 
  "    THEN\n" + 
  "		\n" + // We dont need to insert anything into student we just need the new row
  "        \n" + // because everyting is handled automaticly, exept for their photo
  "		INSERT INTO `student` VALUES ();\n" + 
  "		SET new_student_id = LAST_INSERT_ID();\n" + 
  "        SET NEW.student_id = new_student_id;\n" + 
  "    END IF;\n" + 
  " END;",
  "Trigger trigger_application_status_accepted_insert created if it didn't already exist.");
  
  
  runSQL("CREATE TRIGGER IF NOT EXISTS `trigger_application_status_accepted_update`\n" + 
  " BEFORE UPDATE\n" + 
  " ON `application` FOR EACH ROW\n" + 
  " BEGIN\n" + 
  " \n" + 
  "	DECLARE new_student_id MEDIUMINT UNSIGNED DEFAULT 0;\n" + 
  "	\n" + // If is is accepted create a student record, 2 =	Accepted
  "    IF(NEW.application_status_id = 2 AND OLD.student_id IS NULL)\n" + 
  "    THEN\n" + 
  "		\n" + // We dont need to insert anything into student we just need the new row
  "        \n" + // because everyting is handled automaticly, exept for their photo
  "		INSERT INTO `student` VALUES ();\n" + 
  "		SET new_student_id = LAST_INSERT_ID();\n" + 
  "        SET NEW.student_id = new_student_id;\n" + 
  "    END IF;\n" + 
  " END;",
  "Trigger trigger_application_status_accepted_update created if it didn't already exist.");
}// end of createTriggers()

function addTableData() {

  // Populate the database with account types
  //runSQL("INSERT INTO `account_type` (account_type) VALUES ('Super Admin'), ('Admin');");
  runSQL("CALL create_account_type('Super Admin')", "Created super admin");
  runSQL("CALL create_account_type('Admin')", "Created Admin");
  runSQL("CALL create_account_type('Social Worker')", "Created Social Worker");
  runSQL("CALL create_account_type('Instructor')", "Created Instructor");
  runSQL("CALL create_account_type('Owner')", "Created Owner");
  runSQL("CALL create_account_type('USA Sponsor')", "Created USA Sponsor");

  // Populate the database with application status types
  runSQL("CALL create_application_status('Active')", "Active application status created");
  runSQL("CALL create_application_status('Accepted')", "Accepted application status created");
  runSQL("CALL create_application_status('Rejected')", "Rejected application status created");
  runSQL("CALL create_application_status('Wait Listed')", "Wait Listed application status created");

  // Create Public School Levels
  runSQL("CALL create_public_school_level('8')", "Level 8 for public school level created");
  runSQL("CALL create_public_school_level('9')", "Level 9 for public school level created");
  runSQL("CALL create_public_school_level('10')", "Level 10 for public school level created");
  runSQL("CALL create_public_school_level('11')", "Level 11 for public school level created");
  runSQL("CALL create_public_school_level('12')", "Level 12 for public school level created");
  runSQL("CALL create_public_school_level('adult')", "Level adult for public school level created");

  // Create student status
  runSQL("CALL create_student_status('Active')", "Created Active student status");
  runSQL("CALL create_student_status('Graduated')", "Created Graduated student status");
  runSQL("CALL create_student_status('Removed')", "Created Removed student status");

  // Create contact types
  runSQL("CALL create_contact_type('Phone')", "Added Phone as a contact type");
  runSQL("CALL create_contact_type('Email')", "Added Email as a contact type");

  // Create Day of weeks
  runSQL("CALL create_day_of_week('Sunday')", "Sunday");
  runSQL("CALL create_day_of_week('Monday')", "Monday");
  runSQL("CALL create_day_of_week('Tuesday')", "Tuesday");
  runSQL("CALL create_day_of_week('Wednesday')", "Wednesday");
  runSQL("CALL create_day_of_week('Thursday')", "Thursday");
  runSQL("CALL create_day_of_week('Friday')", "Friday");
  runSQL("CALL create_day_of_week('Saturday')", "Saturday");

  // Create meal times
  runSQL("CALL create_meal_time('Breakfast')", "Created breakfast as a meal time");
  runSQL("CALL create_meal_time('Lunch')", "Created lunch as a meal time");

  // Create assignment status
  runSQL("CALL create_assignment_status('Fail')", "Created assignment status Fail");
  runSQL("CALL create_assignment_status('Success')", "Created assignment status Success");

  // Created semesters
  runSQL("CALL create_semester('Spring 2023', '2023-01-09', '2023-04-24')", "Created Spring semster");
  runSQL("CALL create_semester('Summer 2023', '2023-05-08', '2023-08-11')", "Created Summer semster");
  runSQL("CALL create_semester('Fall 2023', '2023-08-28', '2023-12-08')", "Created Fall semster");

  // Create the levels
  runSQL("CALL create_level('8')", "Level 8 created");
  runSQL("CALL create_level('9')", "Level 9 created");
  runSQL("CALL create_level('10')", "Level 10 created");
  runSQL("CALL create_level('11')", "Level 11 created");
  runSQL("CALL create_level('12')", "Level 12 created");
  runSQL("CALL create_level('adult')", "Level adult created");

  // Create the subjects
  runSQL("CALL create_subject_name('English')", "Created English subject");
  runSQL("CALL create_subject_name('IT')", "Created IT subject");

  // Create subjects
  runSQL("CALL create_subject(1, 1)", "English 8 Created");
  runSQL("CALL create_subject(1, 2)", "English 9 Created");
  runSQL("CALL create_subject(1, 3)", "English 10 Created");
  runSQL("CALL create_subject(1, 4)", "English 11 Created");
  runSQL("CALL create_subject(1, 5)", "English 12 Created");
  runSQL("CALL create_subject(2, 1)", "IT 8 Created");
  runSQL("CALL create_subject(2, 2)", "IT 9 Created");
  runSQL("CALL create_subject(2, 3)", "IT 10 Created");
  runSQL("CALL create_subject(2, 4)", "IT 11 Created");
  runSQL("CALL create_subject(2, 5)", "IT 12 Created");

  // Sample data population

  // password for this account is admin
  //runSQL("INSERT INTO `user` (account_type_id, person_id, salt, hashed_password, email, is_active) " + 
  //"VALUES (1, 1, '7e43af8c89806bcf', '60db1f65a6617317ba485b74ac5c0ee67a80d0aef7ca531af6c7f31ac57ea7ad', 'admin@a.a', true)");
  runSQL("CALL create_user('Super Admin', 'John', 'Doe', 'admin@a.a', '60db1f65a6617317ba485b74ac5c0ee67a80d0aef7ca531af6c7f31ac57ea7ad', '7e43af8c89806bcf', @result)",
         "Created a new super admin - John Doe");

  // TODO: create_application probably needs to create a new person to associate with the application

  //runSQL("INSERT INTO application(person_id, application_status_id, public_school_level_id, student_id, date_of_application, date_of_birth, latitude, longitude, transportation_assistance, meal_assistance, essay)\n" +
  //"VALUES(1, 1, 1, NULL, '2023-01-10', '2007-01-01', 41.24122, 2.10265, false, false, 'I want to learn English/IT');", "Inserted test application");
  runSQL("CALL create_application(1, 1, '2007-01-01', 41.24122, 2.10265, false, false, 'I want to learn English/IT', @result);", "Inserted test application 1");

  //runSQL("INSERT INTO application(person_id, application_status_id, public_school_level_id, student_id, date_of_application, date_of_birth, latitude, longitude, transportation_assistance, meal_assistance, essay)\n" +
  //"VALUES(1, 2, 1, NULL, '2023-01-10', '2007-01-01', 41.24122, 2.10265, true, false, 'I want to learn English/IT');", "Inserted test application");
  runSQL("CALL create_application(1, 3, '2005-01-01', 41.24122, 2.10265, false, false, 'I want to learn English/IT', @result);", "Inserted test application 2");

  //runSQL("INSERT INTO contact_information(person_id, contact_type_id, value)\n" +
  //"VALUES(1, 1, 'contact');", "Inserted sample contact_information");
  runSQL("CALL create_contact(1, 1, '123-456-7890');", "Created sample contact_info for person 1");

  // TODO: create_guardian probably needs to create a new person to be the guardian

  //runSQL("INSERT INTO guardian(person_id, application_id, annual_income) VALUES(1, 1, 15000);", "Inserted sample guardian");
  runSQL("CALL create_guardian(1, 1, 15000.00);", "Created sample guardian for person 1");

} // end of addTableData()

/**
* Runs a SQL query
*/
function runSQL (sql, printmessage){
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: " + printmessage);
    // console.log(rows[1]);
  });
}

module.exports = con;