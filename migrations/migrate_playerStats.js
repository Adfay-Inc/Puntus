const { sequelize } = require('../config/database');

async function addPlayerStatsColumn() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    console.log('🔍 Verificando si la columna playerStats existe...');
    
    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as col_exists 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'puntusAdfay' 
        AND TABLE_NAME = 'match_results' 
        AND COLUMN_NAME = 'playerStats'
    `);

    const columnExists = results[0].col_exists > 0;

    if (columnExists) {
      console.log('✅ La columna playerStats ya existe');
    } else {
      console.log('➕ Agregando columna playerStats...');
      
      await sequelize.query(`
        ALTER TABLE match_results 
        ADD COLUMN playerStats JSON DEFAULT NULL 
        COMMENT 'Estadísticas individuales de jugadores por partida'
      `);

      console.log('✅ Columna playerStats agregada exitosamente');
    }

    // Mostrar estructura actual de la tabla
    console.log('\n📋 Estructura actual de la tabla match_results:');
    const [tableStructure] = await sequelize.query('DESCRIBE match_results');
    console.table(tableStructure);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

// Ejecutar la migración
addPlayerStatsColumn();