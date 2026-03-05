const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: 'c:/Users/crist/OneDrive/Documentos/Biblioteca/FILEs/Paid/turismo-istpet/BACKEND/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ''),
    port: process.env.DB_PORT || 5432,
});

const sql = `
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
`;

async function run() {
    try {
        const res = await pool.query(sql);
        let output = '';
        res.rows.forEach(row => {
            output += `${row.column_name}: ${row.data_type} (Nullable: ${row.is_nullable})\n`;
        });
        fs.writeFileSync('c:/Users/crist/OneDrive/Documentos/Biblioteca/FILEs/Paid/turismo-istpet/BACKEND/user_schema.txt', output);
        console.log('✅ Schema written to user_schema.txt');
    } catch (err) {
        console.error('❌ Error checking schema:', err.message);
    } finally {
        await pool.end();
    }
}

run();
