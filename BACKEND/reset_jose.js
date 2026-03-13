const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        const password = 'Jose2026.';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const res = await pool.query(
            'UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING id_usuario',
            [hashedPassword, 'jose@sistema.com']
        );
        
        if (res.rows.length > 0) {
            console.log('✅ Password for jose@sistema.com has been reset to: Jose2026.');
        } else {
            console.log('❌ User jose@sistema.com not found.');
        }
    } catch (err) {
        console.error('❌ Error resetting password:', err);
    } finally {
        await pool.end();
    }
}

reset();
