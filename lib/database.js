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
      console.log("database.js: Droping database `smart_project`");
      con.query("DROP DATABASE IF EXISTS smart_project");
    }

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
  "  `student_status_id` TINYINT UNSIGNED NOT NULL,\n" +
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
  "  `latitude` DECIMAL(10,8) NOT NULL,\n" +
  "  `longitude` DECIMAL(10,8) NOT NULL,\n" +
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
  
  
  sql = "CREATE TABLE IF NOT EXISTS `smart_project`.`subject` (\n" +
  "  `subject_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
  "  `level_id` TINYINT UNSIGNED NULL,\n" +
  "  `name` VARCHAR(255) NOT NULL,\n" +
  "  INDEX `level_id_fk_idx` (`level_id` ASC) VISIBLE,\n" +
  "  PRIMARY KEY (`subject_id`),\n" +
  "    CONSTRAINT `fk_subject_level_id`\n" +
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

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_account_type`(\n" +
        "IN  accountType VARCHAR(45)\n" +
      ")\n" +
      "BEGIN\n" +
        "INSERT INTO account_type(account_type)\n" +
        "VALUES (accountType);\n" +
      "END;");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_person`(\n" +
        "IN  firstName VARCHAR(45),\n" +
        "IN  lastName VARCHAR(45),\n" +
        "OUT id INT\n" +
      ")\n" +
      "BEGIN\n" +
        "INSERT INTO person(first_name, last_name)\n" +
        "VALUES (firstName, lastName);\n" +

        "SET id = LAST_INSERT_ID();\n" +
      "END;");

  runSQL("CREATE PROCEDURE IF NOT EXISTS `create_user`(\n" +
          "IN  accountType VARCHAR(45),\n" +
          "IN  firstName VARCHAR(45),\n" +
          "IN  lastName VARCHAR(45),\n" +
          "IN  email VARCHAR(45),\n" +
          "IN  hashed_password VARCHAR(255),\n" +
          "IN  salt VARCHAR(255),\n" +
          "OUT result INT\n" +
        ")\n" +
        "BEGIN\n" +
          "DECLARE nCount INT DEFAULT 0;\n" +
          "SET result = 0;\n" +

          "CALL create_person(firstName, lastName, @personID);\n" +

          "SELECT Count(*) INTO nCount FROM user WHERE user.email = email;\n" +
          "IF nCount = 0 THEN\n" +
            "INSERT INTO user(account_type_id, person_id, salt, hashed_password, email, is_active)\n" +
            "VALUES ((SELECT account_type_id FROM account_type WHERE account_type = accountType), @personID, salt, hashed_password, email, true);\n" +
          "ELSE\n" +
            "SET result = 1;\n" +
          "END IF;\n" +
        "END;");
} // end of createStoredProcedures()

function createTriggers(){

}// end of createTriggers()

function addTableData() {

  //runSQL("INSERT INTO `account_type` (account_type) VALUES ('Super Admin'), ('Admin');");
  runSQL("CALL create_account_type('Super Admin')");
  runSQL("CALL create_account_type('Admin')");
  runSQL("CALL create_account_type('Social Worker')");
  runSQL("CALL create_account_type('Instructor')");
  runSQL("CALL create_account_type('Owner')");
  runSQL("CALL create_account_type('USA Sponsor')");

  runSQL("INSERT INTO `person` (first_name, last_name) VALUES ('Jane', 'Doe'), ('John', 'Doe');");

  // password for this account is admin
  runSQL("CALL create_user('Super Admin', 'Super', 'Admin', 'admin@a.a', '60db1f65a6617317ba485b74ac5c0ee67a80d0aef7ca531af6c7f31ac57ea7ad', '7e43af8c89806bcf', @result)");
  //runSQL("INSERT INTO `user` (account_type_id, person_id, salt, hashed_password, email, is_active) " + 
  //"VALUES (1, 1, '7e43af8c89806bcf', '60db1f65a6617317ba485b74ac5c0ee67a80d0aef7ca531af6c7f31ac57ea7ad', 'admin@a.a', true)");

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
    console.log(rows[1]);
  });
}

module.exports = con;