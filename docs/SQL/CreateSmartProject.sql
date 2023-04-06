DROP DATABASE IF EXISTS `smart_project`;
CREATE DATABASE IF NOT EXISTS `smart_project`;
USE `smart_project`;

SET foreign_key_checks = 0;
-- Stores admin, instructions, etc
DROP TABLE IF EXISTS `account_type`; 
-- Stores first and last name
DROP TABLE IF EXISTS `person`; 
-- Stores the password and username information
DROP TABLE IF EXISTS `user`; 
-- Stores which type of is the contact information email, phone, etc
DROP TABLE IF EXISTS `contact_type`; 
-- Stores the value of contact information 
DROP TABLE IF EXISTS `contact_information`; 


 -- Stores if a application is rejected, active, etc
DROP TABLE IF EXISTS `application_status`;
-- Stores their current  grade
DROP TABLE IF EXISTS `public_school_level`; 
-- Stores a students status active, graduated
DROP TABLE IF EXISTS `student_status`;  
-- Stores information about the student 
DROP TABLE IF EXISTS `student`; 
-- Stores an application 
DROP TABLE IF EXISTS `application`; 
 

-- Stores an applications guardian information
DROP TABLE IF EXISTS `guardian`; 
-- What socail workers have what student
DROP TABLE IF EXISTS `social_worker_student`; 
-- A list of notes that a socail worker has 
DROP TABLE IF EXISTS `social_worker_student_note`; 
 -- A list of sponsor(s) a student has 
DROP TABLE IF EXISTS `student_sponsor`;
-- A list of subject levels
DROP TABLE IF EXISTS `level`; 


-- Stores a school subject inforamtion and level english 2, english 3
DROP TABLE IF EXISTS `subject`; 
-- If an assignment was passed or failed
DROP TABLE IF EXISTS `assignment_status`; 
 -- A list of semesters
DROP TABLE IF EXISTS `semester`; 
 -- Classes offered
DROP TABLE IF EXISTS `class`; 
-- What time a student ate (breakfast, lunch)
DROP TABLE IF EXISTS `meal_time`; 


-- What day it is (Sunday, Monday, Tuesday, ...)
DROP TABLE IF EXISTS `day_of_week`; 
-- A list of certificates a student could earn
DROP TABLE IF EXISTS `certificate`; 
-- Stores which certificates a student has earned
DROP TABLE IF EXISTS `student_certificate`;  
-- Days a student has been feed
DROP TABLE IF EXISTS `student_feeding`; 
-- Days a student has attended
DROP TABLE IF EXISTS `student_attendance`;

 
-- What time a student has to go to their public school
DROP TABLE IF EXISTS `student_public_school_schedule`;
-- A list of class assignments
DROP TABLE IF EXISTS `assignment`;
-- A list of completed student assignments 
DROP TABLE IF EXISTS `student_assignment`;
-- Stores path to uploaded documents
DROP TABLE IF EXISTS `student_assignment_document`; 
-- A note for a studnet assignment
DROP TABLE IF EXISTS `assignment_note`; 


-- What time a class is scheduled (based on groups for a double array )
/**
Mondays 7:30-9:30 OR Tuesdays 1:30-3:30  (pick one of these) AND  Wednesdays 9:30-11:30 OR Thursdays 1:30-3:30 (pick one of these).
So then 
Group 1: Mondays 7:30-9:30 OR Tuesdays 1:30-3:30
Group 2: Wednesdays 9:30-11:30 OR Thursdays 1:30-3:30
**/
 DROP TABLE IF EXISTS `class_time`; 
-- A list of what classes a student is taking
DROP TABLE IF EXISTS `student_schedule`;  
 -- What classes an instructor has 
DROP TABLE IF EXISTS `instructor_schedule`; 
SET foreign_key_checks = 1;

/*******************************************************************************************************************************
 * 
 * CREATE TABLE
 *
 *******************************************************************************************************************************/
/***************************************************************
 * Create account_type
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`account_type` (
  `account_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_type` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`account_type_id`))
COMMENT = 'admin, instructors, socail, workers, owners, and sponsors';

/***************************************************************
 * Create person
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`person` (
  `person_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(64) NOT NULL,
  `last_name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`person_id`))
COMMENT = 'Holds first and last name';

/***************************************************************
 * Create user
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`user` (
  `user_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_type_id` TINYINT UNSIGNED NOT NULL,
  `person_id` MEDIUMINT UNSIGNED NOT NULL,
  `salt` CHAR(16) NOT NULL,
  `hashed_password` CHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`),
  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE, 
  INDEX `account_type_id_fk_idx` (`account_type_id` ASC) VISIBLE, 
  CONSTRAINT `fk_user_person_id`
    FOREIGN KEY (`person_id`)
    REFERENCES `smart_project`.`person` (`person_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_account_type_id`
    FOREIGN KEY (`account_type_id`)
    REFERENCES `smart_project`.`account_type` (`account_type_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds login information';

/***************************************************************
 * Create contact_type
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`contact_type` (
  `contact_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`contact_type_id`))
COMMENT = 'Email, Phone';

/***************************************************************
 * Create contact_information
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`contact_information` (
  `contact_information_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` MEDIUMINT UNSIGNED NULL,
  `contact_type_id` TINYINT UNSIGNED NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`contact_information_id`),
  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE,
  INDEX `contact_type_id_fk_idx` (`contact_type_id` ASC) VISIBLE,
  CONSTRAINT `fk_contact_information_person_id`
    FOREIGN KEY (`person_id`)
    REFERENCES `smart_project`.`person` (`person_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_contact_information_contact_type_id`
    FOREIGN KEY (`contact_type_id`)
    REFERENCES `smart_project`.`contact_type` (`contact_type_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds a persons contact information';
 
/***************************************************************
 * Create application_status
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`application_status` (
  `application_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_status` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`application_status_id`))
COMMENT = 'Active, Waitlisted, Accepted, Rejected';

/***************************************************************
 * Create public_school_level
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`public_school_level` (
  `public_school_level_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`public_school_level_id`))
COMMENT = 'Holds their public school level. (8-12), and Adult';

/***************************************************************
 * Create student_status
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_status` (
  `student_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_status` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`student_status_id`))
COMMENT = 'Active, Graduated, Removed ...';

/***************************************************************
 * Create student
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student` (
  `student_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_status_id` TINYINT UNSIGNED NOT NULL,
  `date_of_admission` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `photograph` VARCHAR(15000) NULL,
  PRIMARY KEY (`student_id`))
COMMENT = 'The main student table.';

/***************************************************************
 * Create application
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`application` (
  `application_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` MEDIUMINT UNSIGNED NOT NULL,
  `application_status_id` TINYINT UNSIGNED NOT NULL COMMENT 'After it is set to accepted create a new student record',
  `public_school_level_id` TINYINT UNSIGNED NOT NULL,
  `student_id` MEDIUMINT UNSIGNED NULL,
  `date_of_application` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `date_of_birth` DATE NOT NULL,
  `latitude` DECIMAL(10,8) NOT NULL,
  `longitude` DECIMAL(10,8) NOT NULL,
  `transportation_assistance` BOOLEAN NOT NULL DEFAULT 0,
  `meal_assistance` BOOLEAN NOT NULL DEFAULT 0,
  `essay` VARCHAR(15000) NULL,
  PRIMARY KEY (`application_id`),
  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE,
  INDEX `application_status_id_fk_idx` (`application_status_id` ASC) VISIBLE,
  INDEX `public_school_level_id_fk_idx` (`public_school_level_id` ASC) VISIBLE,
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  CONSTRAINT `fk_application_person_id`
    FOREIGN KEY (`person_id`)
    REFERENCES `smart_project`.`person` (`person_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_application_application_status_id`
    FOREIGN KEY (`application_status_id`)
    REFERENCES `smart_project`.`application_status` (`application_status_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_application_public_school_level_id`
    FOREIGN KEY (`public_school_level_id`)
    REFERENCES `smart_project`.`public_school_level` (`public_school_level_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_application_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'The students application';

/***************************************************************
 * Create guardian
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`guardian` (
  `guardian_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` MEDIUMINT UNSIGNED NOT NULL,
  `application_id` MEDIUMINT UNSIGNED NOT NULL,
  `annual_income` DECIMAL(8,2) NULL,
  PRIMARY KEY (`guardian_id`),
  INDEX `person_id_fk_idx` (`person_id` ASC) VISIBLE,
  INDEX `application_id_fk_idx` (`application_id` ASC) VISIBLE,
  CONSTRAINT `fk_guardian_person_id`
    FOREIGN KEY (`person_id`)
    REFERENCES `smart_project`.`person` (`person_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_guardain_application_id`
    FOREIGN KEY (`application_id`)
    REFERENCES `smart_project`.`application` (`application_id`)
	ON DELETE CASCADE  
    ON UPDATE CASCADE)
COMMENT = 'To hold informa tion about an applicants parent/guardian information';

/***************************************************************
 * Create social_worker_student
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`social_worker_student` (
  `socail_worker_student_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT UNSIGNED NOT NULL,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  PRIMARY KEY (`socail_worker_student_id`),
  INDEX `user_id_fk_idx` (`user_id` ASC) VISIBLE,
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  CONSTRAINT `fk_social_worker_student_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `smart_project`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE ,
  CONSTRAINT `fk_social_worker_student_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'For a link between socail workers and their students';

/***************************************************************
 * Create socail_worker_student_note
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`social_worker_student_note` (
  `social_worker_student_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `social_worker_student_id` MEDIUMINT UNSIGNED NOT NULL,
  `date_taken` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `note` VARCHAR(15000) NOT NULL DEFAULT '',
  PRIMARY KEY (`social_worker_student_note_id`),
  INDEX `social_worker_student_id_fk_idx` (`social_worker_student_id` ASC) VISIBLE,
  CONSTRAINT `fk_social_worker_student_note_social_worker_student_id`
    FOREIGN KEY (`social_worker_student_id`)
    REFERENCES `smart_project`.`social_worker_student` (`socail_worker_student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds notes about a student from a social worker';
 
 /***************************************************************
 * Create student_sponsor
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_sponsor` (
  `student_sponsor_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `user_id` MEDIUMINT UNSIGNED NOT NULL,
  PRIMARY KEY (`student_sponsor_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `user_id_fk_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_sponsor_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_sponsor_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `smart_project`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds the students sponsor(s)';

/***************************************************************
 * Create level
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`level` (
  `level_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`level_id`))
COMMENT = 'Holds the level of the class 8-12, adult';

 /***************************************************************
 * Create subject
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`subject` (
  `subject_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level_id` TINYINT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL,
  INDEX `level_id_fk_idx` (`level_id` ASC) VISIBLE,
  PRIMARY KEY (`subject_id`),
    CONSTRAINT `fk_subject_level_id`
    FOREIGN KEY (`level_id`)
    REFERENCES `smart_project`.`level` (`level_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds the subjects';

/***************************************************************
 * Create assignment_status
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`assignment_status` (
  `assignment_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `status` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`assignment_status_id`))
COMMENT = 'pass, fail';

/***************************************************************
 * Create semester
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`semester` (
  `semester_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  PRIMARY KEY (`semester_id`))
COMMENT = 'Holds the semester fall 2022, winter 2023';

/***************************************************************
 * Create class
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`class` (
  `class_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `semester_id` SMALLINT UNSIGNED NOT NULL,
  `subject_id` SMALLINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL COMMENT 'Gets default from semester its part of',
  `end_date` DATE NOT NULL COMMENT 'Gets default from semester its part of',
  PRIMARY KEY (`class_id`),
  INDEX `semester_id_fk_idx` (`semester_id` ASC) VISIBLE,
  INDEX `subject_id_fk_idx` (`subject_id` ASC) VISIBLE,
  CONSTRAINT `fk_class_semester_id`
    FOREIGN KEY (`semester_id`)
    REFERENCES `smart_project`.`semester` (`semester_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE ,
  CONSTRAINT `fk_class_subject_id`
    FOREIGN KEY (`subject_id`)
    REFERENCES `smart_project`.`subject` (`subject_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
 
 /***************************************************************
 * Create meal_time
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`meal_time` (
  `meal_time_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `time` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`meal_time_id`),
  UNIQUE INDEX `meal_time_id_UNIQUE` (`meal_time_id` ASC) VISIBLE)
COMMENT = 'Breakfast, (and/or) Lunch';

 /***************************************************************
 * Create day_of_week
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`day_of_week` (
  `day_of_week_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`day_of_week_id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
COMMENT = 'Sunday, Monday, Tuesday, ...';

/***************************************************************
 * Create certificate
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`certificate` (
  `certificate_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `subject_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`certificate_id`),
  INDEX `subject_id_fk_idx` (`subject_id` ASC) VISIBLE,
  CONSTRAINT `fk_certificate_subject_id`
    FOREIGN KEY (`subject_id`)
    REFERENCES `smart_project`.`subject` (`subject_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

/***************************************************************
 * Create student_certificate
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_certificate` (
  `student_certificate_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `certificate_id` MEDIUMINT UNSIGNED NOT NULL,
  `date_awarded` DATE NOT NULL,
  PRIMARY KEY (`student_certificate_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `certificate_id_fk_idx` (`certificate_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_certificate_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_certificate_certificate_id`
    FOREIGN KEY (`certificate_id`)
    REFERENCES `smart_project`.`certificate` (`certificate_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds certificates that a student has earned';

/***************************************************************
 * Create student_feeding
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_feeding` (
  `student_feeding_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `meal_time_id` TINYINT UNSIGNED NOT NULL,
  `date_feed` DATE NOT NULL,
  `is_done` BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (`student_feeding_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `meal_time_id_fk_idx` (`meal_time_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_feeding_student_id`
   FOREIGN KEY (`student_id`)
   REFERENCES `smart_project`.`student` (`student_id`)
   ON DELETE CASCADE
   ON UPDATE CASCADE,
  CONSTRAINT `fk_student_feeding_meal_time_id`
   FOREIGN KEY (`meal_time_id`)
   REFERENCES `smart_project`.`meal_time` (`meal_time_id`)
   ON DELETE RESTRICT
   ON UPDATE CASCADE)
COMMENT = 'When a student has been feed'; 

/***************************************************************
 * Create student_attendance
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_attendance` (
  `student_attendance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `date_attended` DATE NOT NULL,
  `is_present` BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (`student_attendance_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_attendance_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_attendance_class_id`
    FOREIGN KEY (`class_id`)
    REFERENCES `smart_project`.`class` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds if a student was present';
 
 /***************************************************************
 * Create student_public_school_schedule
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_public_school_schedule` (
  `student_public_school_schedule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `day_of_week_id` TINYINT UNSIGNED NOT NULL,
  `time` TIME NOT NULL,
  PRIMARY KEY (`student_public_school_schedule_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `day_of_week_id_fk_idx` (`day_of_week_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_public_school_schedule_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_public_school_schedule_day_of_week_id`
    FOREIGN KEY (`day_of_week_id`)
    REFERENCES `smart_project`.`day_of_week` (`day_of_week_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds a students public school schedule';

/***************************************************************
 * Create assignment
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`assignment` (
  `assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `class_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`assignment_id`),
  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,
  CONSTRAINT `fk_assignment_class_id`
    FOREIGN KEY (`class_id`)
    REFERENCES `smart_project`.`class` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds a classes assignments';

/***************************************************************
 * Create student_assignment
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_assignment` (
  `student_assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `assignment_id` INT UNSIGNED NOT NULL,
  `assignment_status_id` TINYINT UNSIGNED NULL,
  `submission_date` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `grade` DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'If the status is null then the assignment has not been graded yet',
  `can_sponsor_view` BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (`student_assignment_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `assignment_id_fk_idx` (`assignment_id` ASC) VISIBLE,
  INDEX `assignment_status_id_fk_idx` (`assignment_status_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_assignment_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_assignment_assignment_id`
    FOREIGN KEY (`assignment_id`)
    REFERENCES `smart_project`.`assignment` (`assignment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_assignment_assignment_status_id`
    FOREIGN KEY (`assignment_status_id`)
    REFERENCES `smart_project`.`assignment_status` (`assignment_status_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
    
/***************************************************************
 * Create student_assignment_document
***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_assignment_document` (
  `student_assignment_document_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_assignment_id` INT UNSIGNED NOT NULL,
  `document_link` VARCHAR(15000) NOT NULL,
  PRIMARY KEY (`student_assignment_document_id`),
  INDEX `student_assignment_id_fk_idx` (`student_assignment_id` ASC) VISIBLE,
   CONSTRAINT `fk_student_assignment_document_student_assignment_id`
    FOREIGN KEY (`student_assignment_id`)
    REFERENCES `smart_project`.`student_assignment` (`student_assignment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds documents that a student did on an assignment';

/***************************************************************
 * Create assignment_note
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`assignment_note` (
  `assignment_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_assignment_id` INT UNSIGNED NOT NULL,
  `note` VARCHAR(15000) NOT NULL DEFAULT '',
  PRIMARY KEY (`assignment_note_id`),
  INDEX `student_assignment_id_fk_idx` (`student_assignment_id` ASC) VISIBLE,
  CONSTRAINT `fk_assignment_note_student_assignment_id`
    FOREIGN KEY (`student_assignment_id`)
    REFERENCES `smart_project`.`student_assignment` (`student_assignment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE); 
    
/***************************************************************
 * Create class_time
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`class_time` (
  `class_time_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `class_id` INT UNSIGNED NOT NULL,
  `day_of_week_id` TINYINT UNSIGNED NOT NULL,
  `group` TINYINT NOT NULL,
  `start_time` TIME NULL,
  `end_time` TIME NULL,
  PRIMARY KEY (`class_time_id`),
  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,
  INDEX `day_of_week_id_fk_id` (`day_of_week_id` ASC) VISIBLE,
  CONSTRAINT `fk_class_time_class_id`
    FOREIGN KEY (`class_id`)
    REFERENCES `smart_project`.`class` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_class_time_day_of_week_id`
    FOREIGN KEY (`day_of_week_id`)
    REFERENCES `smart_project`.`day_of_week` (`day_of_week_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds a double array for possible class times.So table needs to hold Mondays 7:30-9:30 OR Tuesdays 1:30-3:30  (pick one of these) AND  Wednesdays 9:30-11:30 OR Thursdays 1:30-3:30 (pick one of these). So Group 1:  Mondays 7:30-9:30 OR Tuesdays 1:30-3:30, Group 2: Wednesdays 9:30-11:30 OR Thursdays 1:30-3:30';

/***************************************************************
 * Create student_schedule
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`student_schedule` (
  `student_schedule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `class_time_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`student_schedule_id`),
  INDEX `student_id_fk_idx` (`student_id` ASC) VISIBLE,
  INDEX `class_time_id_fk_idx` (`class_time_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_schedule_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_schedule_class_time_id`
    FOREIGN KEY (`class_time_id`)
    REFERENCES `smart_project`.`class_time` (`class_time_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Classes a student is taking';

/***************************************************************
 * Create instructor_schedule
 ***************************************************************/
CREATE TABLE IF NOT EXISTS `smart_project`.`instructor_schedule` (
  `instructor_schedule_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`instructor_schedule_id`),
  INDEX `user_id_fk_idx` (`user_id` ASC) VISIBLE,
  INDEX `class_id_fk_idx` (`class_id` ASC) VISIBLE,
  CONSTRAINT `fk_instructor_scheduxle_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `smart_project`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_instructor_schedule_class_id`
    FOREIGN KEY (`class_id`)
    REFERENCES `smart_project`.`class` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds which instructors goes to which classes';

DELIMITER $$
$$ -- Clear it so the next SP output doest not contain all the comments ab
/*******************************************************************************************************************************
 * 
 * CREATE PROCEDURES
 *
 *******************************************************************************************************************************/
/***************************************************************
* Procedure get_salt
* <comment>Procedure get_salt created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_salt` ( 
 IN email VARCHAR(255), 
 OUT salt CHAR(16) 
) 
BEGIN 
 SELECT user.salt INTO salt FROM user 
 WHERE user.email = email AND user.is_active = TRUE; 
END;
$$


/***************************************************************
* Procedure login_user
* <comment>Procedure login_user created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `login_user` ( 
 IN email VARCHAR(255), 
 IN hashed_password CHAR(64), 
 OUT account_type TINYINT 
) 
BEGIN 
 SELECT 0 INTO account_type; 
 SELECT user.account_type_id INTO account_type FROM user WHERE user.email = email 
 AND user.hashed_password = hashed_password; -- user type 0 is invalid, bad login
END;
$$


/***************************************************************
* Procedure create_account_type
* <comment>Procedure create_account_type created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_account_type`(
IN  accountType VARCHAR(45)
)
BEGIN
INSERT INTO account_type(account_type)
VALUES (accountType);
END;
$$


/***************************************************************
* Procedure create_person
* <comment>Procedure create_person created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_person`(
IN  firstName VARCHAR(45),
IN  lastName VARCHAR(45),
OUT id INT
)
BEGIN
INSERT INTO person(first_name, last_name)
VALUES (firstName, lastName);
SET id = LAST_INSERT_ID();
END;
$$


/***************************************************************
* Procedure create_user
* <comment>Procedure create_user created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_user`(
 IN  accountType VARCHAR(45),
 IN  firstName VARCHAR(45),
 IN  lastName VARCHAR(45),
 IN  email VARCHAR(45),
 IN  hashed_password VARCHAR(255),
 IN  salt VARCHAR(255),
 OUT result INT
)
BEGIN
 DECLARE nCount INT DEFAULT 0;
 SET result = 0;
 CALL create_person(firstName, lastName, @personID);
 SELECT Count(*) INTO nCount FROM user WHERE user.email = email;
 IF nCount = 0 THEN
   INSERT INTO user(account_type_id, person_id, salt, hashed_password, email, is_active)
   VALUES ((SELECT account_type_id FROM account_type WHERE account_type = accountType), @personID, salt, hashed_password, email, true);
 ELSE
   SET result = 1;
 END IF;
END;
$$


/***************************************************************
* Procedure select_applications
* <comment>Procedure select_applications created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `select_applications`(
 IN  applicationStatus VARCHAR(45)
)
BEGIN
 IF applicationStatus IS NOT NULL THEN
   SELECT person.first_name, person.last_name, public_school_level_id, date_of_birth, date_of_application, application_status.application_status
   FROM application
   JOIN person ON person.person_id = application.person_id
   JOIN application_status on application_status.application_status_id = application.application_status_id
   WHERE application_status.application_status = applicationStatus;
 ELSE
   SELECT person.first_name, person.last_name, public_school_level_id, date_of_birth, date_of_application, application_status.application_status
   FROM application
   JOIN person ON person.person_id = application.person_id
   JOIN application_status on application_status.application_status_id = application.application_status_id;
 END IF;
END;
$$


/***************************************************************
* Procedure create_application_status
* <comment>Procedure create_application_status created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_application_status`(
 IN  applicationStatus VARCHAR(45)
)
BEGIN
 INSERT INTO application_status(application_status)
 VALUES(applicationStatus);
END;
$$

/*******************************************************************************************************************************
 * 
 * CREATE TRIGGERS
 *
 *******************************************************************************************************************************/
/***************************************************************
* Trigger trigger_new_application_status
* <comment>Procedure create_user created if it didn't already exist.</comment>
***************************************************************/

