const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function setSpecificPassword() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Jorge2026.', salt);
        
        const result = await pool.query(
            'UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING primer_nombre', 
            [hashedPassword, 'jorge@sistema.com']
        );
        
        if (result.rows.length > 0) {
            console.log(`✅ Contraseña de ${result.rows[0].primer_nombre} (jorge@sistema.com) actualizada a: Jorge2026.`);
        } else {
            console.log('❌ No se encontró al usuario jorge@sistema.com');
        }
        
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

setSpecificPassword();
