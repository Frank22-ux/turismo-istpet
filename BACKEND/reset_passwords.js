const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    try {
        const salt = await bcrypt.genSalt(10);
        
        const guidePassword = await bcrypt.hash('Guia123!', salt);
        const adminPassword = await bcrypt.hash('Admin123!', salt);
        
        await pool.query('UPDATE usuarios SET password = $1 WHERE correo = $2', [guidePassword, 'jorge@sistema.com']);
        await pool.query('UPDATE usuarios SET password = $1 WHERE correo = $2', [adminPassword, 'admin@ecrut.travel']);
        
        console.log('✅ Contraseñas actualizadas con éxito:');
        console.log(' - jorge@sistema.com -> Guia123!');
        console.log(' - admin@ecrut.travel -> Admin123!');
        
    } catch (err) {
        console.error('❌ Error al resetear contraseñas:', err);
    } finally {
        pool.end();
    }
}

resetPasswords();
