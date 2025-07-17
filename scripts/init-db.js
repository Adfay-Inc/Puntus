const { syncDatabase, User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('Sincronizando base de datos...');
    
    // Sincronizar todas las tablas (force: true las recrea)
    await syncDatabase(true);
    
    console.log('Base de datos sincronizada exitosamente');
    
    // Crear usuario admin por defecto
    console.log('Creando usuario administrador...');
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@puntus.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        displayName: 'Administrador',
        bio: 'Usuario administrador del sistema'
      },
      emailVerified: true
    });
    
    console.log('Usuario admin creado:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Crear usuario creator de ejemplo
    const creatorUser = await User.create({
      username: 'adfay',
      email: 'adfay@puntus.com',
      password: 'creator123',
      role: 'creator',
      profile: {
        displayName: 'Adfay',
        bio: 'Creador de scrims'
      },
      emailVerified: true
    });
    
    console.log('Usuario creator creado:', {
      id: creatorUser.id,
      username: creatorUser.username,
      email: creatorUser.email,
      role: creatorUser.role
    });
    
    console.log('\n🎉 Base de datos inicializada correctamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('Admin: admin@puntus.com / admin123');
    console.log('Creator: adfay@puntus.com / creator123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();