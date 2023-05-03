USE `smart_project`;

DELIMITER $$
$$ -- Clear it so the next SP output doest not contain all the comments ab

CREATE PROCEDURE IF NOT EXISTS `list_params` ( 
	IN param_name VARCHAR(255)
) 
BEGIN 
	DECLARE finished INTEGER DEFAULT 0;
	DECLARE new_line VARCHAR(255);
	    
    DECLARE cur_param
    CURSOR FOR
		SELECT CONCAT('\t - ',PARAMETER_MODE, ' ', PARAMETER_NAME, ' ', DATA_TYPE) 
		FROM information_schema.parameters 
		WHERE SPECIFIC_NAME = param_name; 
	
	-- declare NOT FOUND handler
	DECLARE CONTINUE HANDLER 
	FOR NOT FOUND SET finished = 1;

    OPEN cur_param;
    gen_list: LOOP
		FETCH cur_param INTO new_line;
		-- Leave the loop
		IF finished = 1 THEN 
			LEAVE gen_list;
		END IF;

        INSERT INTO list_procs_output_table VALUES (new_line);
	END LOOP gen_list;
    CLOSE cur_param;
END;
$$

CREATE PROCEDURE IF NOT EXISTS `list_procs` ( 
) 
BEGIN 
	DECLARE finished INTEGER DEFAULT 0;
	DECLARE new_line VARCHAR(255);
    
	DECLARE cur_list
    CURSOR FOR
		SELECT routine_name
		FROM information_schema.routines 
		WHERE routine_type = 'PROCEDURE' 
		AND routine_schema = 'smart_project';
    
    
	-- declare NOT FOUND handler
	DECLARE CONTINUE HANDLER 
	FOR NOT FOUND SET finished = 1;
    
    -- Create temp table after all the declares 
    DROP TEMPORARY TABLE IF EXISTS list_procs_output_table;
	CREATE TEMPORARY TABLE list_procs_output_table(
	output VARCHAR(255)
	);
    
    OPEN cur_list;
    gen_list: LOOP
		FETCH cur_list INTO new_line;
        
		-- Exit the loop
        IF finished = 1 THEN
			LEAVE gen_list;
		END IF;
        
        INSERT INTO list_procs_output_table VALUES (new_line);
        
		CALL `list_params`(new_line);
        
        -- Add two blank lines
        INSERT INTO list_procs_output_table VALUES ('');


	END LOOP gen_list;
	CLOSE cur_list; 
    
	SELECT * FROM list_procs_output_table;
END;
$$

CREATE PROCEDURE IF NOT EXISTS `list_procs_name` ( 
) 
BEGIN
	SELECT CONCAT('DROP PROCEDURE IF EXISTS `', routine_name, '`;')
	FROM information_schema.routines 
	WHERE routine_type = 'PROCEDURE' 
	AND routine_schema = 'smart_project';
END;
$$

CALL `list_procs`();

$$