USE `smart_project`;

DROP PROCEDURE IF EXISTS `check_application_id`;
DROP PROCEDURE IF EXISTS `check_application_status`;
DROP PROCEDURE IF EXISTS `create_account_type`;
DROP PROCEDURE IF EXISTS `create_application`;
DROP PROCEDURE IF EXISTS `create_application_status`;
DROP PROCEDURE IF EXISTS `create_assignment_status`;
DROP PROCEDURE IF EXISTS `create_class`;
DROP PROCEDURE IF EXISTS `create_class_time`;
DROP PROCEDURE IF EXISTS `create_contact`;
DROP PROCEDURE IF EXISTS `create_contact_type`;
DROP PROCEDURE IF EXISTS `create_day_of_week`;
DROP PROCEDURE IF EXISTS `create_guardian`;
DROP PROCEDURE IF EXISTS `create_instructor_schedule`;
DROP PROCEDURE IF EXISTS `create_level`;
DROP PROCEDURE IF EXISTS `create_meal_time`;
DROP PROCEDURE IF EXISTS `create_person`;
DROP PROCEDURE IF EXISTS `create_public_school_level`;
DROP PROCEDURE IF EXISTS `create_semester`;
DROP PROCEDURE IF EXISTS `create_student_status`;
DROP PROCEDURE IF EXISTS `create_subject`;
DROP PROCEDURE IF EXISTS `create_subject_name`;
DROP PROCEDURE IF EXISTS `create_user`;
DROP PROCEDURE IF EXISTS `get_classes`;
DROP PROCEDURE IF EXISTS `get_day_of_weeks`;
DROP PROCEDURE IF EXISTS `get_personid_from_applicationid`;
DROP PROCEDURE IF EXISTS `get_salt`;
DROP PROCEDURE IF EXISTS `get_semesters`;
DROP PROCEDURE IF EXISTS `login_user`;
DROP PROCEDURE IF EXISTS `select_applications`;
DROP PROCEDURE IF EXISTS `select_application_details`;
DROP PROCEDURE IF EXISTS `select_contact_info`;
DROP PROCEDURE IF EXISTS `select_guardians`;
DROP PROCEDURE IF EXISTS `update_application_status`;

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
  SELECT application_id, person.first_name, person.last_name, public_school_level.level, date_of_birth, date_of_application, application_status.application_status
  FROM application
  JOIN person ON person.person_id = application.person_id
  JOIN application_status ON application_status.application_status_id = application.application_status_id
  JOIN public_school_level ON public_school_level.public_school_level_id = application.public_school_level_id
  WHERE application_status.application_status = applicationStatus;
 ELSE
  SELECT application_id, person.first_name, person.last_name, public_school_level.level, date_of_birth, date_of_application, application_status.application_status
  FROM application
  JOIN person ON person.person_id = application.person_id
  JOIN application_status ON application_status.application_status_id = application.application_status_id
  JOIN public_school_level ON public_school_level.public_school_level_id = application.public_school_level_id;
 END IF;
END;
$$


/***************************************************************
* Procedure select_application_details
* <comment>Procedure select_application_details created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `select_application_details`(
 IN  applicationID MEDIUMINT
)
BEGIN
 SELECT person.first_name, person.last_name, date_of_birth, latitude, longitude, public_school_level.level,  +
 date_of_application, transportation_assistance, meal_assistance, essay, application_status.application_status
 FROM application
 JOIN person ON person.person_id = application.person_id
 JOIN application_status on application_status.application_status_id = application.application_status_id
 JOIN public_school_level ON public_school_level.public_school_level_id = application.public_school_level_id
 WHERE application_id = applicationID;
END;
$$


/***************************************************************
* Procedure select_contact_info
* <comment>Procedure select_contact_info created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `select_contact_info`(
 IN  personID MEDIUMINT
)
BEGIN
 SELECT contact_type.type, value
 FROM contact_information
 JOIN contact_type ON contact_type.contact_type_id = contact_information.contact_type_id
 WHERE person_id = personID;
END;
$$


/***************************************************************
* Procedure get_personid_from_applicationid
* <comment>Procedure select_contact_info created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_personid_from_applicationid`(
 IN  applicationID MEDIUMINT,
 OUT personID MEDIUMINT
)
BEGIN
 SET personID =
 (SELECT person_id
 FROM application
 WHERE application_id = applicationID);
END;
$$


/***************************************************************
* Procedure select_guardians
* <comment>Procedure select_guardians created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `select_guardians`(
 IN  applicationID MEDIUMINT
)
BEGIN
 SELECT person.first_name, person.last_name, annual_income
 FROM guardian
 JOIN person ON person.person_id = guardian.person_id
 WHERE application_id = applicationID;
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


/***************************************************************
* Procedure create_public_school_level
* <comment>Procedure create_public_school_level created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_public_school_level`(
 IN public_school_level_name VARCHAR(255)
)
BEGIN
	INSERT INTO `public_school_level`
	(`level`)
	VALUES
	(public_school_level_name);
END;
$$


/***************************************************************
* Procedure create_student_status
* <comment>Procedure create_student_status created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_student_status`(
 IN student_status VARCHAR(64)
)
BEGIN
INSERT INTO `student_status`
	(`student_status`)
	VALUES
	(student_status);
END;
$$


/***************************************************************
* Procedure create_contact_type
* <comment>Procedure create_contact_type created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_contact_type`(
 IN contact_type VARCHAR(64)
)
BEGIN
	INSERT INTO `contact_type`
	(`type`)
	VALUES
	(contact_type);
END;
$$


/***************************************************************
* Procedure create_day_of_week
* <comment>Procedure create_day_of_week created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_day_of_week`(
 IN day_of_week VARCHAR(64)
)
BEGIN
	INSERT INTO `day_of_week`
	(`name`)
	VALUES
	(day_of_week);
END;
$$


/***************************************************************
* Procedure create_meal_time
* <comment>Procedure create_day_of_week created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_meal_time`(
 IN meal_time VARCHAR(255)
)
BEGIN
	INSERT INTO `meal_time`
	(`time`)
	VALUES
	(meal_time);
END;
$$


/***************************************************************
* Procedure create_assignment_status
* <comment>Procedure create_assignment_status created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_assignment_status`(
 IN assignment_status VARCHAR(64)
)
BEGIN
	INSERT INTO `assignment_status`
	(`status`)
	VALUES
	(assignment_status);
END;
$$


/***************************************************************
* Procedure create_semester
* <comment>Procedure create_semester created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_semester`(
 IN semester_description VARCHAR(255),
 IN start_date DATE,
 IN end_date DATE
)
BEGIN
	INSERT INTO `semester`
	(`description`,
	`start_date`,
	`end_date`)
	VALUES
	(semester_description,
	start_date,
	end_date);
END;
$$


/***************************************************************
* Procedure create_subject
* <comment>Procedure create_subject created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_subject`(
 IN subject_name_id SMALLINT UNSIGNED,
 IN level_id TINYINT UNSIGNED
)
BEGIN
	INSERT INTO `smart_project`.`subject`
	(`subject_name_id`,
    `level_id`)
	VALUES
	(subject_name_id,
	level_id);
END;
$$


/***************************************************************
* Procedure create_level
* <comment>Procedure create_level created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_level`(
 IN level_name VARCHAR(255)
)
BEGIN
	INSERT INTO `level`
	(`level_name`)
	VALUES
	(level_name);
END;
$$


/***************************************************************
* Procedure create_subject_name
* <comment>Procedure create_level created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_subject_name`(
 IN subject_name VARCHAR(255)
)
BEGIN
	INSERT INTO `subject_name`
	(`subject_name`)
	VALUES
	(subject_name);
END;
$$


/***************************************************************
* Procedure create_application
* <comment>Procedure create_application created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_application`(
 IN person_id MEDIUMINT, 
 IN public_school_level_id TINYINT, 
 IN date_of_birth DATE, 
 IN latitude DECIMAL(11,8), 
 IN longitude DECIMAL(11,8), 
 IN transportation_assistance BOOLEAN, 
 IN meal_assistance BOOLEAN, 
 IN essay VARCHAR(15000), 
 OUT id INT
)
BEGIN
	INSERT INTO `application`
	(`person_id`, `application_status_id`, `public_school_level_id`, `date_of_birth`, `latitude`, `longitude`, 
	    `transportation_assistance`, `meal_assistance`, `essay`)
	VALUES
	(person_id, 1, public_school_level_id, date_of_birth, latitude, longitude, 
	    transportation_assistance, meal_assistance, essay);
 
 SET id = LAST_INSERT_ID();
END;
$$


/***************************************************************
* Procedure create_contact
* <comment>Procedure create_contact created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_contact`(
 IN person_id MEDIUMINT, 
 IN contact_type TINYINT, 
 IN value VARCHAR(250)
)
BEGIN
	INSERT INTO `contact_information`
	(`person_id`, `contact_type_id`, `value`)
	VALUES
	(person_id, contact_type, value);
END;
$$


/***************************************************************
* Procedure create_guardian
* <comment>Procedure create_guardian created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_guardian`(
 IN person_id MEDIUMINT, 
 IN application_id MEDIUMINT, 
 IN annual_income DECIMAL(8,2) 
)
BEGIN
 INSERT INTO guardian(`person_id`, `application_id`, `annual_income`)
 VALUES (person_id, application_id, annual_income);
END;
$$


/***************************************************************
* Procedure check_application_id
* <comment>Procedure check_application_id created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `check_application_id`(
 IN application_id MEDIUMINT UNSIGNED, 
 OUT result BOOLEAN
)
BEGIN
	SET result = (SELECT EXISTS(
		SELECT * 
        FROM `application`
        WHERE
        application.`application_id` = application_id
    ));
END;
$$


/***************************************************************
* Procedure check_application_status
* <comment>Procedure check_application_status created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `check_application_status`(
 IN application_status varchar(64), 
 OUT application_status_id TINYINT UNSIGNED
)
BEGIN    
	SELECT
     `as`.`application_status_id`
     INTO 
     application_status_id
    FROM `application_status` AS `as`
    WHERE `as`.`application_status` LIKE application_status
    LIMIT 1;
    
	IF application_status_id IS NULL
    THEN
		SET application_status_id = 0;
	END IF;
END;
$$


/***************************************************************
* Procedure update_application_status
* <comment>Procedure update_application_status created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `update_application_status`(
 IN application_id MEDIUMINT UNSIGNED,
 IN appliation_status_id TINYINT UNSIGNED
)
BEGIN
	UPDATE `application`
    SET `application_status_id` = appliation_status_id
	WHERE `application_id` = application_id
    LIMIT 1;
END;
$$


/***************************************************************
* Procedure get_semesters
* <comment>Procedure get_semesters created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_semesters`(
)
BEGIN
	SELECT 
    `semester`.`semester_id`,
    `semester`.`description`,
    `semester`.`start_date`,
    `semester`.`end_date`
	FROM 
	`smart_project`.`semester`;
END;
$$


/***************************************************************
* Procedure get_classes
* <comment>Procedure get_classes created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_classes`(
)
BEGIN
	SELECT 
		s.`subject_id`,
        s.`subject_name_id`,
        sn.`subject_name`,
        s.`level_id`,
        lv.`level_name`
	FROM 
	`subject` AS `s`
    INNER JOIN `subject_name` AS `sn`
     ON s.`subject_name_id` = sn.`subject_name_id`
    LEFT JOIN `level` AS `lv`
     ON s.`level_id` = lv.`level_id`;
END;
$$


/***************************************************************
* Procedure get_day_of_week
* <comment>Procedure get_day_of_week created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_day_of_weeks`(
)
BEGIN
	SELECT `day_of_week_id`, `name`
	FROM `smart_project`.`day_of_week`
    ORDER BY `day_of_week_id` ASC;
END;
$$

/***************************************************************
* Procedure create_class
* <comment>Procedure create_class created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_class`(
	IN semester_id SMALLINT UNSIGNED,
    IN subject_name_id SMALLINT UNSIGNED,
    IN level_id TINYINT UNSIGNED,
    OUT class_id INT UNSIGNED
)
BEGIN
	-- Find the subject id
    DECLARE subject_id SMALLINT UNSIGNED;
    
    SELECT s.`subject_id` 
    INTO subject_id
    FROM `subject` AS s
    WHERE s.subject_name_id = subject_name_id AND
    s.level_id = level_id
    LIMIT 1;
    
    -- Start and end dates will be handled by a trigger
	INSERT INTO `class`
	(`semester_id`,
	`subject_id`)
	VALUES
	(semester_id, 
    subject_id
    );
    
     SET class_id = LAST_INSERT_ID();
END;
$$

/***************************************************************
* Procedure create_class_time
* <comment>Procedure create_class_time created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_class_time`(
	IN class_id INT UNSIGNED,
    IN day_of_week_id TINYINT UNSIGNED,
    IN `group` TINYINT UNSIGNED,
    IN start_time TIME,
    IN end_time TIME
)
BEGIN
	INSERT INTO `class_time`
	(`class_id`,
	`day_of_week_id`,
	`group`,
	`start_time`,
	`end_time`)
	VALUES
	(class_id,
    day_of_week_id,
    `group`,
    start_time,
    end_time);
END;
$$

/***************************************************************
* Procedure create_instructor_schedule
* <comment>Procedure create_instructor_schedule created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `create_instructor_schedule`(
	IN email VARCHAR(255),
    IN class_id INT UNSIGNED
)
BEGIN
	-- Since we are storing the email in the session we need to get the user_id from their email
    DECLARE user_id MEDIUMINT UNSIGNED;
    
    SELECT u.user_id INTO user_id
    FROM `user` AS u
    WHERE u.email LIKE email;
    
    INSERT INTO `instructor_schedule`
	(`user_id`,
	`class_id`)
	VALUES
	(user_id,
    class_id);
END;
$$


/***************************************************************
* Procedure get_meal_times
* <comment>Procedure get_meal_times created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_meal_times`(
)
BEGIN
	SELECT 
    `meal_time_id`,
    `time`
	FROM `meal_time`;
END;
$$


/***************************************************************
* Procedure get_students_with_meal_assistance
* <comment>Procedure get_students_with_meal_assistance created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_students_with_meal_assistance`(
)
BEGIN
	SELECT 
    s.`student_id`,
    p.`first_name`,
	p.`last_name`
	FROM 
	`student` AS s
    INNER JOIN `application` AS a
    ON a.student_id = s.student_id
    INNER JOIN `person` AS p
    ON p.person_id = a.person_id
    WHERE -- Only get active students in need of meal assistance
    s.student_status_id = 1 AND
    a.meal_assistance = TRUE;
END;
$$


/***************************************************************
* Procedure add_feeding
* <comment>Procedure add_feeding created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `add_feeding`(
	student_id MEDIUMINT UNSIGNED,
    meal_time_id TINYINT UNSIGNED,
    date_feed DATE,
    is_done BOOLEAN
)
BEGIN
	INSERT INTO `smart_project`.`student_feeding`
	(
	`student_id`,
	`meal_time_id`,
	`date_feed`,
	`is_done`)
	VALUES
	(
	student_id,
	meal_time_id,
	date_feed,
	is_done
    );
END;
$$

/***************************************************************
* Procedure get_feedings
* <comment>Procedure get_feedings created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `get_feedings`(
    date_feed DATE
)
BEGIN
	IF date_feed IS NOT NULL THEN
		SELECT
		`student_id`,
		`meal_time_id`,
		`date_feed`,
		`is_done`
		FROM
		student_feeding
        WHERE
        student_feeding.`date_feed` = date_feed;
    END IF;
END;
$$

