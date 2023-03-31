CREATE DATABASE IF NOT EXISTS `smart_project`;
USE `smart_project`;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS `account_type`; -- Stores admin, instructions, etc
DROP TABLE IF EXISTS `person`; -- Stores first and last name
DROP TABLE IF EXISTS `contact_type`; -- Stores which type of is the contact information email, phone, etc
DROP TABLE IF EXISTS `contact_information`; -- Stores the value of contact information
DROP TABLE IF EXISTS `user`; -- Stores the password and username information

DROP TABLE IF EXISTS `application_status`; -- Stores if a application is rejected, active, etc
DROP TABLE IF EXISTS `public_school_subject`; -- Stores their current grade
DROP TABLE IF EXISTS `application`; -- Stores an application
DROP TABLE IF EXISTS `guardian`; -- Stores an applications guardian information
DROP TABLE IF EXISTS `student_status`; -- Stores a students status active, graduated

DROP TABLE IF EXISTS `student`; -- Stores information about the student 
DROP TABLE IF EXISTS `subject`; -- Stores a school subject inforamtion and level english 2, english 3
DROP TABLE IF EXISTS `course_level`; -- Each student can have learned many subjects
DROP TABLE IF EXISTS `certificate`; -- A list of certificates a student could earn
DROP TABLE IF EXISTS `student_certificate`; -- Stores which certificates a student has earned

DROP TABLE IF EXISTS `semester`; -- A list of semesters
DROP TABLE IF EXISTS `class`; -- Classes offered
DROP TABLE IF EXISTS `assignment_status`; -- If an assignment was passed or failed
DROP TABLE IF EXISTS `assignment_note`; -- A note for a studnet assignment
DROP TABLE IF EXISTS `student_assignment_document`; -- Stores path to uploaded documents

DROP TABLE IF EXISTS `assignment`; --
DROP TABLE IF EXISTS `student_assignment`; -- A list of completed student assignments
DROP TABLE IF EXISTS `student_attendance`; -- Days a student has attended
DROP TABLE IF EXISTS `student_feeding`; -- Days a student has been feed
DROP TABLE IF EXISTS `student_schedule`; -- A list of what classes a student is taking

DROP TABLE IF EXISTS `student_sponsor`; -- A list of sponsor(s) a student has
DROP TABLE IF EXISTS `instructor_schedule`; -- What classes an instructor has 
DROP TABLE IF EXISTS `social_worker_student`; -- What socail workers have what student
DROP TABLE IF EXISTS `social_worker_student_note`; -- A list of notes that a socail worker has

DROP TABLE IF EXISTS `public_school_level`; -- A list of notes that a socail worker has
SET foreign_key_checks = 1;

/*******************************************************************************************************************************
 * 
 * CREATE TABLES
 *
 *******************************************************************************************************************************/
/***************************************************************
 * Create account_type
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS`smart_project`.`account_type` (
  `account_type_id` TINYINT UNSIGNED NOT NULL,
  `account_type` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`account_type_id`),
  UNIQUE INDEX `account_type_id_UNIQUE` (`account_type_id` ASC) VISIBLE)
COMMENT = 'admin, instructors, socail, workers, owners, and sponsors';

/***************************************************************
 * Create person
 ***************************************************************/ 
CREATE TABLE IF NOT EXISTS `smart_project`.`person` (
  `person_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(64) NOT NULL,
  `last_name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`person_id`),
  UNIQUE INDEX `person_id_UNIQUE` (`person_id` ASC) VISIBLE)
COMMENT = 'Holds first and last name';

/***************************************************************
 * Create user
 ***************************************************************/ 
CREATE TABLE `smart_project`.`user` (
  `user_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_type_id` TINYINT UNSIGNED NOT NULL,
  `person_id` MEDIUMINT UNSIGNED NOT NULL,
  `user_name` VARCHAR(64) NOT NULL,
  `salt` CHAR(16) NOT NULL,
  `hashed_password` CHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `person_id_UNIQUE` (`person_id` ASC) VISIBLE,
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
CREATE TABLE `smart_project`.`contact_type` (
  `contact_type_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`contact_type_id`),
  UNIQUE INDEX `contact_type_id_UNIQUE` (`contact_type_id` ASC) VISIBLE)
COMMENT = 'Email, Phone';

/***************************************************************
 * Create contact_information
 ***************************************************************/ 
CREATE TABLE `smart_project`.`contact_information` (
  `contact_information_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` MEDIUMINT UNSIGNED NULL,
  `contact_type_id` TINYINT UNSIGNED NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`contact_information_id`),
  UNIQUE INDEX `contact_information_id_UNIQUE` (`contact_information_id` ASC) VISIBLE,
  UNIQUE INDEX `person_id_UNIQUE` (`person_id` ASC) VISIBLE,
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
CREATE TABLE `smart_project`.`application_status` (
  `application_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_status` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`application_status_id`),
  UNIQUE INDEX `application_status_id_UNIQUE` (`application_status_id` ASC) VISIBLE)
COMMENT = 'Active, Waitlisted, Accepted, Rejected';

/***************************************************************
 * Create public_school_level
 ***************************************************************/
CREATE TABLE `smart_project`.`public_school_level` (
  `public_school_level_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`public_school_level_id`),
  UNIQUE INDEX `public_school_level_id_UNIQUE` (`public_school_level_id` ASC) VISIBLE)
COMMENT = 'Holds their public school level. (8-12), and Adult';

/***************************************************************
 * Create student_status
 ***************************************************************/
CREATE TABLE `smart_project`.`student_status` (
  `student_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_status` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`student_status_id`),
  UNIQUE INDEX `student_status_id_UNIQUE` (`student_status_id` ASC) VISIBLE)
COMMENT = 'Active, Graduated, Removed ...';

/***************************************************************
 * Create student
 ***************************************************************/
CREATE TABLE `smart_project`.`student` (
  `student_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_status_id` TINYINT UNSIGNED NOT NULL,
  `date_of_admission` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `photograph` VARCHAR(15000) NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE INDEX `student_id_UNIQUE` (`student_id` ASC) VISIBLE)
COMMENT = 'The main student table.';

/***************************************************************
 * Create application
 ***************************************************************/
CREATE TABLE `smart_project`.`application` (
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
  UNIQUE INDEX `application_id_UNIQUE` (`application_id` ASC) VISIBLE,
  UNIQUE INDEX `person_id_UNIQUE` (`person_id` ASC) VISIBLE,
  UNIQUE INDEX `student_id_UNIQUE` (`student_id` ASC) VISIBLE,
  CONSTRAINT `fk_application_person_id`
    FOREIGN KEY (`person_id`)
    REFERENCES `smart_project`.`person` (`person_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'The students application';

/***************************************************************
 * Create guardian
 ***************************************************************/
CREATE TABLE `smart_project`.`guardian` (
  `guardian_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` MEDIUMINT UNSIGNED NOT NULL,
  `application_id` MEDIUMINT UNSIGNED NOT NULL,
  `annual_income` DECIMAL(8,2) NULL,
  PRIMARY KEY (`guardian_id`),
  UNIQUE INDEX `guardian_id_UNIQUE` (`guardian_id` ASC) VISIBLE,
  UNIQUE INDEX `person_id_UNIQUE` (`person_id` ASC) VISIBLE,
  CONSTRAINT `fk_guardian_person_person_id`
    FOREIGN KEY (`person_id`)
    REFERENCES `smart_project`.`person` (`person_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_guardain_application_id`
    FOREIGN KEY (`application_id`)
    REFERENCES `smart_project`.`application` (`application_id`)
	ON DELETE CASCADE  
    ON UPDATE CASCADE)
COMMENT = 'To hold information about an applicants parent/guardian information';

/***************************************************************
 * Create social_worker_student
 ***************************************************************/
 CREATE TABLE `smart_project`.`social_worker_student` (
  `socail_worker_student_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT UNSIGNED NOT NULL,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  PRIMARY KEY (`socail_worker_student_id`),
  UNIQUE INDEX `socail_worker_student_id_UNIQUE` (`socail_worker_student_id` ASC) VISIBLE,
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
 CREATE TABLE `smart_project`.`social_worker_student_note` (
  `social_worker_student_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `social_worker_student_id` MEDIUMINT UNSIGNED NOT NULL,
  `date_taken` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `note` VARCHAR(15000) NOT NULL DEFAULT '',
  PRIMARY KEY (`social_worker_student_note_id`),
  UNIQUE INDEX `social_worker_student_note_id_UNIQUE` (`social_worker_student_note_id` ASC) VISIBLE,
  CONSTRAINT `fk_social_worker_student_note_social_worker_student_id`
    FOREIGN KEY (`social_worker_student_id`)
    REFERENCES `smart_project`.`social_worker_student` (`socail_worker_student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds notes about a student from a social worker';
 
 /***************************************************************
 * Create student_sponsor
 ***************************************************************/
 CREATE TABLE `smart_project`.`student_sponsor` (
  `student_sponsor_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `user_id` MEDIUMINT UNSIGNED NOT NULL,
  PRIMARY KEY (`student_sponsor_id`),
  UNIQUE INDEX `student_sponsor_id_UNIQUE` (`student_sponsor_id` ASC) VISIBLE,
  INDEX `fk_student_sponsor_user_id_idx` (`user_id` ASC) VISIBLE,
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
 * Create subject
 ***************************************************************/
CREATE TABLE `smart_project`.`subject` (
  `subject_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  ` level` VARCHAR(255) NULL,
  PRIMARY KEY (`subject_id`),
  UNIQUE INDEX `subject_id_UNIQUE` (`subject_id` ASC) VISIBLE)
COMMENT = 'Holds the subjects';

/***************************************************************
 * Create course_level
 ***************************************************************/
CREATE TABLE `smart_project`.`course_level` (
  `course_level_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `subject_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`course_level_id`),
  UNIQUE INDEX `course_level_id_UNIQUE` (`course_level_id` ASC) VISIBLE,
  INDEX `fk_course_level_subject_id_idx` (`subject_id` ASC) VISIBLE,
  CONSTRAINT `fk_course_level_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_course_level_subject_id`
    FOREIGN KEY (`subject_id`)
    REFERENCES `smart_project`.`subject` (`subject_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds a students course(s) level(s)';

/***************************************************************
 * Create semester
 ***************************************************************/
  CREATE TABLE `smart_project`.`semester` (
  `semester_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  PRIMARY KEY (`semester_id`),
  UNIQUE INDEX `semester_id_UNIQUE` (`semester_id` ASC) VISIBLE)
COMMENT = 'Holds the semester fall 2022, winter 2023';

/***************************************************************
 * Create class
 ***************************************************************/
CREATE TABLE `smart_project`.`class` (
  `class_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `semester_id` SMALLINT UNSIGNED NOT NULL,
  `subject_id` SMALLINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL COMMENT 'Gets default from semester its part of',
  `end_date` DATE NOT NULL COMMENT 'Gets default from semester its part of',
  PRIMARY KEY (`class_id`),
  UNIQUE INDEX `class_id_UNIQUE` (`class_id` ASC) VISIBLE,
  INDEX `fk_class_semester_id_idx` (`semester_id` ASC) VISIBLE,
  INDEX `fk_class_subject_id_idx` (`subject_id` ASC) VISIBLE,
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
 * Create assignment
 ***************************************************************/
  CREATE TABLE `smart_project`.`assignment` (
  `assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `class_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`assignment_id`),
  UNIQUE INDEX `assignment_id_UNIQUE` (`assignment_id` ASC) VISIBLE,
  INDEX `fk_assignment_class_id_idx` (`class_id` ASC) VISIBLE,
  CONSTRAINT `fk_assignment_class_id`
    FOREIGN KEY (`class_id`)
    REFERENCES `smart_project`.`class` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds a classes assignments';

/***************************************************************
 * Create assignment_status
 ***************************************************************/
 CREATE TABLE `smart_project`.`assignment_status` (
  `assignment_status_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `status` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`assignment_status_id`),
  UNIQUE INDEX `assignment_status_id_UNIQUE` (`assignment_status_id` ASC) VISIBLE)
COMMENT = 'pass, fail';

/***************************************************************
 * Create student_assignment
 ***************************************************************/
CREATE TABLE `smart_project`.`student_assignment` (
  `student_assignment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `assignment_id` INT UNSIGNED NOT NULL,
  `assignment_status_id` TINYINT UNSIGNED NULL,
  `submission_date` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `grade` DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'If the status is null then the assignment has not been graded yet',
  PRIMARY KEY (`student_assignment_id`),
  UNIQUE INDEX `student_assignment_id_UNIQUE` (`student_assignment_id` ASC) VISIBLE,
  INDEX `fk_student_assignment_assignment_id_idx` (`assignment_id` ASC) VISIBLE,
  INDEX `fk_student_assignment_assignment_status_id_idx` (`assignment_status_id` ASC) VISIBLE,
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
 * Create assignment_note
 ***************************************************************/
CREATE TABLE `smart_project`.`assignment_note` (
  `assignment_note_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_assignment_id` INT UNSIGNED NOT NULL,
  `note` VARCHAR(15000) NOT NULL DEFAULT '',
  PRIMARY KEY (`assignment_note_id`),
  UNIQUE INDEX `assignment_note_id_UNIQUE` (`assignment_note_id` ASC) VISIBLE,
  CONSTRAINT `fk_assignment_note_student_assignment_id`
    FOREIGN KEY (`student_assignment_id`)
    REFERENCES `smart_project`.`student_assignment` (`student_assignment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

/***************************************************************
 * Create student_assignment_document
 ***************************************************************/
CREATE TABLE `smart_project`.`student_assignment_document` (
  `student_assignment_document_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_assignment_id` MEDIUMINT UNSIGNED NOT NULL,
  `document_link` VARCHAR(15000) NOT NULL,
  PRIMARY KEY (`student_assignment_document_id`),
  UNIQUE INDEX `student_assignment_document_id_UNIQUE` (`student_assignment_document_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_assignment_document_student_assignment_id`
    FOREIGN KEY (`student_assignment_id`)
    REFERENCES `smart_project`.`student_assignment` (`student_assignment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Holds documents that a student did on an assignment';

/***************************************************************
 * Create student_attendance
 ***************************************************************/
CREATE TABLE `smart_project`.`student_attendance` (
  `student_attendance_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `date_attended` DATE NOT NULL,
  `is_present` BOOLEAN NOT NULL,
  PRIMARY KEY (`student_attendance_id`),
  UNIQUE INDEX `student_attendance_id_UNIQUE` (`student_attendance_id` ASC) VISIBLE,
  INDEX `fk_student_attendance_class_id_idx` (`class_id` ASC) VISIBLE,
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
 * Create meal_time
 ***************************************************************/
CREATE TABLE `smart_project`.`meal_time` (
  `meal_time_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `time` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`meal_time_id`),
  UNIQUE INDEX `meal_time_id_UNIQUE` (`meal_time_id` ASC) VISIBLE)
COMMENT = 'Breakfast, (and/or) Lunch';

/***************************************************************
 * Create student_feeding
 ***************************************************************/
CREATE TABLE `smart_project`.`student_feeding` (
  `student_feeding_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `meal_time_id` TINYINT UNSIGNED NOT NULL,
  `date_feed` DATE NOT NULL,
  `is_done` BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (`student_feeding_id`),
  UNIQUE INDEX `student_feeding_id_UNIQUE` (`student_feeding_id` ASC) VISIBLE)
COMMENT = 'When a student has been feed';

/***************************************************************
 * Create student_schedule
 ***************************************************************/
CREATE TABLE `smart_project`.`student_schedule` (
  `student_schedule_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`student_schedule_id`),
  UNIQUE INDEX `student_schedule_id_UNIQUE` (`student_schedule_id` ASC) VISIBLE,
  INDEX `fk_student_schedule_class_id_idx` (`class_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_schedule_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `smart_project`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_student_schedule_class_id`
    FOREIGN KEY (`class_id`)
    REFERENCES `smart_project`.`class` (`class_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
COMMENT = 'Classes a student is taking';

/***************************************************************
 * Create certificate
 ***************************************************************/
CREATE TABLE `smart_project`.`certificate` (
  `certificate_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `subject_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`certificate_id`),
  UNIQUE INDEX `certificate_id_UNIQUE` (`certificate_id` ASC) VISIBLE,
  INDEX `fk_certificate_subject_id_idx` (`subject_id` ASC) VISIBLE,
  CONSTRAINT `fk_certificate_subject_id`
    FOREIGN KEY (`subject_id`)
    REFERENCES `smart_project`.`subject` (`subject_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
    
/***************************************************************
 * Create student_certificate
 ***************************************************************/
CREATE TABLE `smart_project`.`student_certificate` (
  `student_certificate_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` MEDIUMINT UNSIGNED NOT NULL,
  `certificate_id` MEDIUMINT UNSIGNED NOT NULL,
  `date_awarded` DATE NOT NULL,
  PRIMARY KEY (`student_certificate_id`),
  UNIQUE INDEX `student_certificate_id_UNIQUE` (`student_certificate_id` ASC) VISIBLE,
  INDEX `fk_student_certificate_certificate_id_idx` (`certificate_id` ASC) VISIBLE,
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
 * Create instructor_schedule
 ***************************************************************/
CREATE TABLE `smart_project`.`instructor_schedule` (
  `instructor_schedule_id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`instructor_schedule_id`),
  UNIQUE INDEX `instructor_schedule_id_UNIQUE` (`instructor_schedule_id` ASC) VISIBLE,
  INDEX `fk_instructor_schedule_user_id_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_instructor_schedule_class_id_idx` (`class_id` ASC) VISIBLE,
  CONSTRAINT `fk_instructor_schedule_user_id`
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


/*******************************************************************************************************************************
 * 
 * CREATE PROCEDURES
 *
 *******************************************************************************************************************************/


/*******************************************************************************************************************************
 * 
 * CREATE TRIGGERS
 *
 *******************************************************************************************************************************/
