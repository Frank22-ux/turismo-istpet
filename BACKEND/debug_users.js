const pool = require('./src/config/db');
async function run() {
    const res = await pool.query('SELECT correo, password FROM usuarios WHERE correo IN (\'jorge@sistema.com\', \'jose@sistema.com\')');
    res.rows.forEach(r => console.log(r.correo + ':' + r.password));
    await pool.end();
}
run();
