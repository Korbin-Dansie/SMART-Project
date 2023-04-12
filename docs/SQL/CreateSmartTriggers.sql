USE `smart_project`;

DELIMITER $$
$$ -- Clear it so the next SP output doest not contain all the comments ab
/*******************************************************************************************************************************
 * 
 * CREATE PROCEDURES
 *
 *******************************************************************************************************************************/
/***************************************************************
* Trigger trigger_application_status_accepted_insert
* <comment>Trigger trigger_application_status_accepted_insert created if it didn't already exist.</comment>
***************************************************************/
CREATE TRIGGER IF NOT EXISTS `trigger_application_status_accepted_insert`
 BEFORE INSERT
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


/***************************************************************
* Trigger trigger_application_status_accepted_update
* <comment>Trigger trigger_application_status_accepted_update created if it didn't already exist.</comment>
***************************************************************/
CREATE TRIGGER IF NOT EXISTS `trigger_application_status_accepted_update`
 BEFORE UPDATE
 ON `application` FOR EACH ROW
 BEGIN
 
	DECLARE new_student_id MEDIUMINT UNSIGNED DEFAULT 0;
	-- If is is accepted create a student record, 2 =	Accepted
    IF(NEW.application_status_id = 2 AND OLD.student_id IS NULL)
    THEN
		-- We dont need to insert anything into student we just need the new row
        -- because everyting is handled automaticly, exept for their photo
		INSERT INTO `student` VALUES ();
		SET new_student_id = LAST_INSERT_ID();
        SET NEW.student_id = new_student_id;
    END IF;
 END;
$$ 

/***************************************************************
* Trigger trigger_insert_class
* <comment>Trigger trigger_insert_class created if it didn't already exist.</comment>
***************************************************************/
CREATE TRIGGER IF NOT EXISTS `trigger_insert_class`
 BEFORE INSERT
 ON `class` FOR EACH ROW
 BEGIN
	-- Get the start and end dates from the semester the class is part of
    DECLARE start_date DATE;
    DECLARE end_date DATE;
    
    SELECT s.start_date, s.end_date
    INTO start_date, end_date
    FROM `semester` as s
    WHERE s.semester_id = new.semester_id;
    
    SET new.start_date = start_date;
    SET new.end_date = end_date;
 END;
$$ 