const pool = require('./src/config/db');

async function checkUsers() {
    try {
        const query = `
            SELECT u.id_usuario, u.primer_nombre, r.nombre_rol, u.id_rol
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol;
        `;
        const { rows } = await pool.query(query);
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkUsers();
