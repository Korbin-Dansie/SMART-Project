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
* Procedure select_application_details
* <comment>Procedure select_application_details created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE IF NOT EXISTS `select_application_details`(
 IN  applicationID MEDIUMINT
)
BEGIN
 SELECT person.first_name, person.last_name, date_of_birth, latitude, longitude, public_school_level_id, public_school_gpa, +
 date_of_application, transportation_assistance, meal_assistance, essay, application_status.application_status
 FROM application
 JOIN person ON person.person_id = application.person_id
 JOIN application_status on application_status.application_status_id = application.application_status_id
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
* Procedure get_public_school_level_id
* <comment>Procedure get_public_school_level_id created if it didn't already exist.</comment>
***************************************************************/
CREATE PROCEDURE `get_public_school_level_id`(
 IN public_school_level_name VARCHAR(255),
 OUT public_school_level_id TINYINT
)
BEGIN
	SELECT `level` INTO public_school_level_id
    FROM `public_school_level`
	WHERE 
	`level` = public_school_level_name
    LIMIT 1;
 END;
$$

/***************************************************************
* Procedure create_application
* <comment>Procedure create_application created if it didn't already exist.</comment>
***************************************************************/
/*
CREATE PROCEDURE IF NOT EXISTS `create_application`(
 IN first_name VARCHAR(64),
 IN last_name VARCHAR(64),
 IN public_school_level VARCHAR(255),
 IN date_of_birth DATE,
 IN latitude DECIMAL(10,8),
 IN longitude DECIMAL(10,8),
 IN transportation_assistance BOOLEAN,
 IN meal_assistance BOOLEAN,
 IN essay VARCHAR(15000),
 OUT application_id UNSIGNED MEDIUM INT
)
BEGIN
INSERT INTO `person`
(`first_name`,
`last_name`)
VALUES
(first_name,
last_name);

DECLARE personid UNSIGNED MEDIUM INT;
SELECT personid = LAST_INSERT_ID()


INSERT INTO `application`
(`person_id`,
`public_school_level_id`,
`public_school_gpa`,
`student_id`,
`date_of_application`,
`date_of_birth`,
`latitude`,
`longitude`,
`transportation_assistance`,
`meal_assistance`,
`essay`)
VALUES
(personid,
<{public_school_level_id: }>,
<{public_school_gpa: }>,
<{student_id: }>,
<{date_of_application: curdate()}>,
<{date_of_birth: }>,
<{latitude: }>,
<{longitude: }>,
<{transportation_assistance: 0}>,
<{meal_assistance: 0}>,
<{essay: }>);
END;
$$
*/

/*******************************************************************************************************************************
 * 
 * CREATE TRIGGERS
 *
 *******************************************************************************************************************************/
/***************************************************************
* Trigger trigger_new_application_status
* <comment>Procedure create_user created if it didn't already exist.</comment>
***************************************************************/