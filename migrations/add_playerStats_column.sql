-- Migración para agregar columna playerStats a la tabla match_results
-- Ejecutar este script en MariaDB/MySQL desde Windows

USE puntusAdfay;

-- Verificar si la columna ya existe antes de agregarla
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'puntusAdfay' 
  AND TABLE_NAME = 'match_results' 
  AND COLUMN_NAME = 'playerStats';

-- Solo agregar la columna si no existe
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE match_results ADD COLUMN playerStats JSON DEFAULT NULL COMMENT "Estadísticas individuales de jugadores por partida"',
    'SELECT "La columna playerStats ya existe" as mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que la columna se agregó correctamente
DESCRIBE match_results;