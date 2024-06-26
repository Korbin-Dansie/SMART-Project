USE `smart_project`;

SELECT CONCAT('DROP TABLE IF EXISTS `', table_name, '`;')
FROM information_schema.tables
WHERE table_schema = 'smart_project';

SELECT CONCAT('DROP TRIGGER IF EXISTS `', trigger_name, '`;')
from information_schema.triggers
WHERE trigger_schema = 'smart_project';

SELECT CONCAT('DROP PROCEDURE IF EXISTS `', routine_name, '`;')
from information_schema.routines 
WHERE routine_type = 'PROCEDURE' 
AND routine_schema = 'smart_project';

SELECT count(*) AS 'Number of Tables'
FROM information_schema.tables
WHERE table_schema = 'smart_project';

SELECT count(*) AS 'Number of Procs'
from information_schema.routines 
WHERE routine_type = 'PROCEDURE' 
AND routine_schema = 'smart_project';





