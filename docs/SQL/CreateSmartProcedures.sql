USE `smart_project`;
DROP PROCEDURE IF EXISTS `check_application_id`;
DROP PROCEDURE IF EXISTS `check_application_status`;
DROP PROCEDURE IF EXISTS `create_account_type`;
DROP PROCEDURE IF EXISTS `create_application`;
DROP PROCEDURE IF EXISTS `create_application_status`;
DROP PROCEDURE IF EXISTS `create_assignment_status`;
DROP PROCEDURE IF EXISTS `create_contact`;
DROP PROCEDURE IF EXISTS `create_contact_type`;
DROP PROCEDURE IF EXISTS `create_day_of_week`;
DROP PROCEDURE IF EXISTS `create_guardian`;
DROP PROCEDURE IF EXISTS `create_level`;
DROP PROCEDURE IF EXISTS `create_meal_time`;
DROP PROCEDURE IF EXISTS `create_person`;
DROP PROCEDURE IF EXISTS `create_public_school_level`;
DROP PROCEDURE IF EXISTS `create_semester`;
DROP PROCEDURE IF EXISTS `create_student_status`;
DROP PROCEDURE IF EXISTS `create_subject`;
DROP PROCEDURE IF EXISTS `create_subject_name`;
DROP PROCEDURE IF EXISTS `create_user`;
DROP PROCEDURE IF EXISTS `get_personid_from_applicationid`;
DROP PROCEDURE IF EXISTS `get_salt`;
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

/*******************************************************************************************************************************
 * 
 * CREATE TRIGGERS
 *
 *******************************************************************************************************************************/
/***************************************************************
* trigger trigger_application_status_accepted_insert
* <comment>Trigger trigger_application_status_accepted_insert created if it didn't already exist.</comment>
***************************************************************/
CREATE TRIGGER `trigger_application_status_accepted_insert`
 AFTER INSERT
 ON `application` FOR EACH ROW
 BEGIN
 
	DECLARE new_student_id MEDIUMINT UNSIGNED DEFAULT 0;
	-- If is is accepted create a student record, 2 =	Accepted
    IF(NEW.application_status_id = 2)
    THEN
		-- We dont need to insert anything into student we just need the new row
        -- because everyting is handled automaticly, exept for their photo
		INSERT INTO `student` VALUES ();
		SET new_student_id = LAST_INSERT_ID();
        SET NEW.student_id = new_student_id;
    END IF;
 END;
 $$
 
 