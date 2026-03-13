
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function checkAll() {
    try {
        const { rows: users } = await pool.query('SELECT primer_nombre, correo, password FROM usuarios WHERE id_rol = 2');
        console.log(`Checking ${users.length} guides...\n`);

        const commonSuffixes = ['2026.', '2025.', '2024.', '123!', '.', '1', '2026', '!'];

        for (const user of users) {
            console.log(`User: ${user.correo}`);
            const name = normalize(user.primer_nombre);
            const variations = [
                `${name}2026.`,
                `${name.toLowerCase()}2026.`,
                `${name}2025.`,
                `${name}123!`,
                `${name}Guia123!`,
                `Guia123!`
            ];
            
            let found = false;
            for (const v of variations) {
                if (await bcrypt.compare(v, user.password)) {
                    console.log(`  ✅ MATCH FOUND: "${v}"`);
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log(`  ❌ No match in basic variations. Name in DB: "${user.primer_nombre}"`);
            }
            console.log('-------------------');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkAll();
