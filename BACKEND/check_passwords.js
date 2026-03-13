const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function check() {
    const res = await pool.query('SELECT correo, password FROM usuarios WHERE correo = \'jose@sistema.com\'');
    let out = '';
    const r = res.rows[0];
    if (!r) {
        out = 'User jose@sistema.com not found';
    } else {
        const passwords = ['Jose2026', 'Jose2026.', 'jose2026'];
        out += `User: ${r.correo}\n  Hash: ${r.password}\n`;
        for (const p of passwords) {
            const m = await bcrypt.compare(p, r.password);
            out += `  Matches ${p}: ${m}\n`;
        }
    }
    const fs = require('fs');
    fs.writeFileSync('check_results.txt', out);
    await pool.end();
}
check();
