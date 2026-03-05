const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/crist/OneDrive/Documentos/Biblioteca/FILEs/Paid/turismo-istpet/BACKEND/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ''),
    port: process.env.DB_PORT || 5432,
});

const sql = `
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tours'
ORDER BY ordinal_position;
`;

async function run() {
    try {
        const res = await pool.query(sql);
        console.table(res.rows);
    } catch (err) {
        console.error('❌ Error checking schema:', err.message);
    } finally {
        await pool.end();
    }
}

run();
