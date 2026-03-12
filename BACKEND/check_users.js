const pool = require('./src/config/db');

async function checkUser() {
    try {
        const res = await pool.query('SELECT id_usuario, correo, primer_nombre, id_rol, cedula FROM usuarios');
        console.log('--- USUARIOS REGISTRADOS ---');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkUser();
