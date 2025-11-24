require('dotenv').config();
const db = require('../src/config/database');

/**
 * Script para asignar edificios a usuarios que no tienen uno asignado
 * Solo afecta a usuarios con rol subscriber
 * Asigna edificios de forma equilibrada (round-robin)
 */

async function assignBuildings() {
  let connection;
  
  try {
    console.log('🚀 Iniciando asignación de edificios...\n');
    
    // Get connection
    connection = await db.getConnection();
    
    // 1. Get all buildings
    console.log('📋 Obteniendo lista de edificios...');
    const [buildings] = await connection.execute(
      'SELECT id, nombre FROM wp_condo360_edificios ORDER BY id ASC'
    );
    
    if (buildings.length === 0) {
      console.error('❌ No se encontraron edificios en la base de datos.');
      console.log('💡 Ejecuta primero la migración: migrations/add-buildings-support.sql');
      process.exit(1);
    }
    
    console.log(`✅ Se encontraron ${buildings.length} edificios:`);
    buildings.forEach(building => {
      console.log(`   - ${building.nombre} (ID: ${building.id})`);
    });
    console.log('');
    
    // 2. Get all subscribers (users with subscriber role)
    console.log('👥 Obteniendo usuarios con rol subscriber...');
    const [subscribers] = await connection.execute(`
      SELECT DISTINCT u.ID, u.user_login, u.display_name
      FROM wp_users u
      INNER JOIN wp_usermeta um ON u.ID = um.user_id
      WHERE um.meta_key = 'wp_capabilities'
      AND um.meta_value LIKE '%subscriber%'
      ORDER BY u.ID ASC
    `);
    
    console.log(`✅ Se encontraron ${subscribers.length} usuarios con rol subscriber\n`);
    
    if (subscribers.length === 0) {
      console.log('⚠️  No hay usuarios subscriber para procesar.');
      process.exit(0);
    }
    
    // 3. Check which users already have a building assigned
    console.log('🔍 Verificando usuarios con edificio asignado...');
    const usersWithBuilding = [];
    const usersWithoutBuilding = [];
    
    for (const user of subscribers) {
      const [buildingMeta] = await connection.execute(
        'SELECT meta_value FROM wp_usermeta WHERE user_id = ? AND meta_key = ?',
        [user.ID, 'edificio']
      );
      
      if (buildingMeta.length > 0 && buildingMeta[0].meta_value) {
        usersWithBuilding.push({
          ...user,
          edificio: buildingMeta[0].meta_value
        });
      } else {
        usersWithoutBuilding.push(user);
      }
    }
    
    console.log(`✅ Usuarios con edificio asignado: ${usersWithBuilding.length}`);
    console.log(`⚠️  Usuarios sin edificio asignado: ${usersWithoutBuilding.length}\n`);
    
    if (usersWithoutBuilding.length === 0) {
      console.log('✅ Todos los usuarios ya tienen edificio asignado. No hay nada que hacer.');
      process.exit(0);
    }
    
    // 4. Assign buildings in a balanced way (round-robin)
    console.log('🏗️  Asignando edificios de forma equilibrada...\n');
    
    let buildingIndex = 0;
    let assignedCount = 0;
    let skippedCount = 0;
    
    for (const user of usersWithoutBuilding) {
      // Get building name
      const building = buildings[buildingIndex];
      const buildingName = building.nombre;
      
      // Check if building exists in wp_condo360_edificios
      const [buildingCheck] = await connection.execute(
        'SELECT id FROM wp_condo360_edificios WHERE nombre = ?',
        [buildingName]
      );
      
      if (buildingCheck.length === 0) {
        console.log(`⚠️  Edificio "${buildingName}" no existe en wp_condo360_edificios. Saltando usuario ${user.user_login}...`);
        skippedCount++;
        continue;
      }
      
      // Check if meta already exists
      const [existingMeta] = await connection.execute(
        'SELECT umeta_id FROM wp_usermeta WHERE user_id = ? AND meta_key = ?',
        [user.ID, 'edificio']
      );
      
      if (existingMeta.length > 0) {
        // Update existing meta
        await connection.execute(
          'UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?',
          [buildingName, user.ID, 'edificio']
        );
        console.log(`   ✅ Actualizado: ${user.user_login} (${user.display_name || 'N/A'}) → ${buildingName}`);
      } else {
        // Insert new meta
        await connection.execute(
          'INSERT INTO wp_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?)',
          [user.ID, 'edificio', buildingName]
        );
        console.log(`   ✅ Asignado: ${user.user_login} (${user.display_name || 'N/A'}) → ${buildingName}`);
      }
      
      assignedCount++;
      
      // Move to next building (round-robin)
      buildingIndex = (buildingIndex + 1) % buildings.length;
    }
    
    console.log('\n📊 Resumen:');
    console.log(`   ✅ Usuarios procesados: ${assignedCount}`);
    console.log(`   ⚠️  Usuarios saltados: ${skippedCount}`);
    console.log(`   📋 Total usuarios con edificio: ${usersWithBuilding.length + assignedCount}`);
    console.log(`   🏢 Edificios utilizados: ${buildings.length}\n`);
    
    // 5. Show distribution
    console.log('📈 Distribución de usuarios por edificio:');
    const [distribution] = await connection.execute(`
      SELECT um.meta_value as edificio, COUNT(*) as total
      FROM wp_users u
      INNER JOIN wp_usermeta um_role ON u.ID = um_role.user_id AND um_role.meta_key = 'wp_capabilities'
      INNER JOIN wp_usermeta um ON u.ID = um.user_id AND um.meta_key = 'edificio'
      WHERE um_role.meta_value LIKE '%subscriber%'
      GROUP BY um.meta_value
      ORDER BY um.meta_value ASC
    `);
    
    distribution.forEach(item => {
      const bar = '█'.repeat(Math.floor(item.total / 2));
      console.log(`   ${item.edificio.padEnd(25)} ${item.total.toString().padStart(3)} usuarios ${bar}`);
    });
    
    console.log('\n✅ Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error durante la asignación de edificios:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    // Close database pool
    await db.end();
    process.exit(0);
  }
}

// Run the script
assignBuildings();

